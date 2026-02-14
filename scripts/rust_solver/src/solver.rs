use crate::board::{Board, Cell};

pub fn solve(board: &mut Board, limit: usize) -> Vec<Vec<(usize, usize)>> {
    let mut solutions = Vec::new();
    let mut forbidden = vec![false; board.size * board.size];
    solve_recursive(board, &mut forbidden, &mut solutions, limit);
    solutions
}

fn solve_recursive(
    board: &mut Board,
    forbidden: &mut Vec<bool>, // true if cell CANNOT be a bulb
    solutions: &mut Vec<Vec<(usize, usize)>>,
    limit: usize,
) {
    if solutions.len() >= limit {
        return;
    }

    if !board.is_valid() {
        return;
    }

    // --- Propagation Phase ---
    let mut local_forbidden = forbidden.clone();
    let mut bulbs_placed = Vec::new();

    // Loop for constraint propagation
    let mut changed = true;
    while changed {
        changed = false;

        // Rule 1: Numbered Walls
        for r in 0..board.size {
            for c in 0..board.size {
                if let Cell::Black(Some(n)) = board.get(r, c) {
                    let mut bulb_count = 0;
                    let mut empty_neighbors = Vec::new();

                    for (nr, nc) in board.get_neighbors(r, c) {
                        let idx = nr * board.size + nc;
                        match board.get(nr, nc) {
                            Cell::Bulb => bulb_count += 1,
                            Cell::White => {
                                // An 'Unknown' neighbor is one that is White, Unlit (or Lit??), and Not Forbidden.
                                // Wait, if it's Lit, can it accept a bulb? No.
                                // So valid placement candidates are White + Unlit + Not Forbidden.
                                if !local_forbidden[idx] && board.lit_map[idx] == 0 {
                                    empty_neighbors.push((nr, nc));
                                }
                            }
                            _ => {}
                        }
                    }

                    if bulb_count > n {
                        undo_changes(board, &bulbs_placed);
                        return;
                    }

                    // Satisfied: Forbid remaining
                    if bulb_count == n {
                        for (nr, nc) in &empty_neighbors {
                            let idx = nr * board.size + nc;
                            if !local_forbidden[idx] {
                                local_forbidden[idx] = true;
                                changed = true;
                            }
                        }
                    }

                    // Needed: Place bulbs if exactly enough space
                    let needed = n - bulb_count;
                    if needed > 0 {
                        if (empty_neighbors.len() as u8) < needed {
                            undo_changes(board, &bulbs_placed);
                            return;
                        }
                        if empty_neighbors.len() as u8 == needed {
                            for &(nr, nc) in &empty_neighbors {
                                board.place_bulb(nr, nc);
                                bulbs_placed.push((nr, nc));
                                changed = true;
                            }
                        }
                    }
                }
            }
        }

        // Rule 2: Unlit Cells constraints
        // If an unlit cell has only 1 way to be lit (itself or one neighbor), force it.
        // Or if 0 ways, fail.
        // This is expensive to check every loop?
        // Let's do a quick scan.
        for r in 0..board.size {
            for c in 0..board.size {
                if let Cell::White = board.get(r, c) {
                    if board.lit_map[r * board.size + c] == 0 {
                        // Unlit white cell
                        let lighters = get_lighters(board, &local_forbidden, r, c);
                        if lighters.is_empty() {
                            undo_changes(board, &bulbs_placed);
                            return;
                        }
                        if lighters.len() == 1 {
                            // Force placement
                            let (lr, lc) = lighters[0];
                            // Check if this location is valid (it should be, since it was returned by get_lighters)
                            // But maybe we just placed a bulb there in this loop iteration?
                            // get_lighters checks board state.
                            if let Cell::White = board.get(lr, lc) {
                                board.place_bulb(lr, lc);
                                bulbs_placed.push((lr, lc));
                                changed = true;
                            }
                        }
                    }
                }
            }
        }
    }

    // Check validity after propagation
    if !board.is_valid() {
        undo_changes(board, &bulbs_placed);
        return;
    }

    if board.is_solved() {
        let mut sol = Vec::new();
        for r in 0..board.size {
            for c in 0..board.size {
                if let Cell::Bulb = board.get(r, c) {
                    sol.push((r, c));
                }
            }
        }
        solutions.push(sol);
        undo_changes(board, &bulbs_placed);
        return;
    }

    // --- Selection Phase ---
    // Select a variable to branch on.
    // Logic: Identify a "Constraint" (Unlit cell OR Unsatisfied Wall) that is most critical.
    // Then pick a candidate cell `C` that helps satisfy it.

    let mut best_target_score = 1000;
    let mut branch_cell = None;

    // 1. Scan Unlit Cells
    for r in 0..board.size {
        for c in 0..board.size {
            if let Cell::White = board.get(r, c) {
                if board.lit_map[r * board.size + c] == 0 {
                    let lighters = get_lighters(board, &local_forbidden, r, c);
                    if lighters.is_empty() {
                        undo_changes(board, &bulbs_placed);
                        return;
                    }
                    if lighters.len() < best_target_score {
                        best_target_score = lighters.len();
                        branch_cell = Some(lighters[0]); // Pick first lighter as candidate
                    }
                }
            }
        }
    }

    // 2. Scan Unsatisfied Walls (if no unlit cells found or to find better constraint)
    // Wall constraints are tight. If a wall has 2 empty spots and needs 1 bulb, it's 50/50.
    // Unlit cell with 2 lighters is also 50/50.
    // Let's just use Unlit Cells first. If all lit, check walls.

    if branch_cell.is_none() {
        // All cells lit. Puzzles usually have unlit cells if not solved.
        // But maybe walls are the issue.
        for r in 0..board.size {
            for c in 0..board.size {
                if let Cell::Black(Some(n)) = board.get(r, c) {
                    if !board.is_satisfied(r, c) {
                        // Find unknown neighbors
                        let mut candidates = Vec::new();
                        for (nr, nc) in board.get_neighbors(r, c) {
                            if board.get(nr, nc) == Cell::White
                                && !local_forbidden[nr * board.size + nc]
                                && board.lit_map[nr * board.size + nc] == 0
                            {
                                candidates.push((nr, nc));
                            }
                        }

                        if !candidates.is_empty() {
                            // Just pick one
                            branch_cell = Some(candidates[0]);
                            break;
                        }
                    }
                }
            }
            if branch_cell.is_some() {
                break;
            }
        }
    }

    if let Some((r, c)) = branch_cell {
        let idx = r * board.size + c;

        // Branch 1: Place Bulb at (r, c)
        if !local_forbidden[idx] && board.lit_map[idx] == 0 {
            board.place_bulb(r, c);
            solve_recursive(board, &mut local_forbidden, solutions, limit);
            board.remove_bulb(r, c);
        }

        // Branch 2: Forbid (r, c)
        if solutions.len() < limit {
            local_forbidden[idx] = true;
            solve_recursive(board, &mut local_forbidden, solutions, limit);
            // No need to backtrack local_forbidden, it's a clone for this stack frame (and children).
            // Actually, we modified `local_forbidden` for BRANCH 2.
            // If we interpret `local_forbidden` as "current state", yes.
            // But strict backtracking?
            // `local_forbidden` is passed mutably.
            // If we change it, it STAYS changed for subsequent operations in THIS function.
            // But we are at end of function. So it doesn't matter.
        }
    }

    // Cleanup
    undo_changes(board, &bulbs_placed);
}

fn undo_changes(board: &mut Board, bulbs: &[(usize, usize)]) {
    for &(r, c) in bulbs {
        board.remove_bulb(r, c);
    }
}

fn get_lighters(board: &Board, forbidden: &[bool], r: usize, c: usize) -> Vec<(usize, usize)> {
    let mut lighters = Vec::new();

    // Check Self
    if !forbidden[r * board.size + c] {
        lighters.push((r, c));
    }

    // Up
    for i in (0..r).rev() {
        if board.is_wall(i, c) {
            break;
        }
        if !forbidden[i * board.size + c] && board.lit_map[i * board.size + c] == 0 {
            lighters.push((i, c));
        }
    }
    // Down
    for i in (r + 1)..board.size {
        if board.is_wall(i, c) {
            break;
        }
        if !forbidden[i * board.size + c] && board.lit_map[i * board.size + c] == 0 {
            lighters.push((i, c));
        }
    }
    // Left
    for j in (0..c).rev() {
        if board.is_wall(r, j) {
            break;
        }
        if !forbidden[r * board.size + j] && board.lit_map[r * board.size + j] == 0 {
            lighters.push((r, j));
        }
    }
    // Right
    for j in (c + 1)..board.size {
        if board.is_wall(r, j) {
            break;
        }
        if !forbidden[r * board.size + j] && board.lit_map[r * board.size + j] == 0 {
            lighters.push((r, j));
        }
    }
    lighters
}
