use akari_solver_lib::board::{Board, Cell};
use akari_solver_lib::io::{self, PuzzleData};
use akari_solver_lib::solver;
use clap::{Parser, Subcommand};
use rand::prelude::*;
use std::path::PathBuf;

#[derive(Parser)]
#[command(name = "akari_manager")]
#[command(about = "Manage Akari puzzles", long_about = None)]
struct Cli {
    #[command(subcommand)]
    command: Commands,
}

#[derive(Subcommand)]
enum Commands {
    /// Verify puzzles in a file
    Verify {
        #[arg(value_name = "FILE")]
        file: PathBuf,
        #[arg(value_name = "SIZE")]
        size: usize,
    },
    /// Add new puzzles to a file
    Add {
        #[arg(value_name = "FILE")]
        file: PathBuf,
        #[arg(value_name = "SIZE")]
        size: usize,
        #[arg(value_name = "COUNT")]
        count: usize,
    },
    /// Generate a single puzzle and print to stdout
    Generate {
        #[arg(value_name = "SIZE")]
        size: usize,
    },
    /// Update a file (remove invalid puzzles and reformat)
    Update {
        #[arg(value_name = "FILE")]
        file: PathBuf,
        #[arg(value_name = "SIZE")]
        size: usize,
    },
}

fn main() {
    let cli = Cli::parse();

    match &cli.command {
        Commands::Verify { file, size } => {
            verify_file(file, *size);
        }
        Commands::Add { file, size, count } => {
            add_puzzles(file, *size, *count);
        }
        Commands::Update { file, size } => {
            update_file(file, *size);
        }
        Commands::Generate { size } => {
            if let Some((encoded, solution)) = generate_puzzle(*size) {
                println!("Board: {}", encoded);
                println!("Solution: {:?}", solution);
            } else {
                println!("Failed to generate puzzle.");
            }
        }
    }
}

fn verify_file(path: &PathBuf, size: usize) {
    println!("Verifying {} (size {}x{})...", path.display(), size, size);
    let content = match io::read_file(path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            return;
        }
    };

    let puzzles = io::parse_puzzles(&content);
    println!("Found {} puzzles.", puzzles.len());

    let mut valid_count = 0;
    let mut solvable_count = 0;
    let mut unique_count = 0;

    for (i, p) in puzzles.iter().enumerate() {
        let board = match Board::new(size, &p.board_str) {
            Some(b) => b,
            None => {
                println!(
                    "  Puzzle #{} has invalid board string length or chars.",
                    i + 1
                );
                continue;
            }
        };

        if !board.is_valid() {
            println!(
                "  Puzzle #{} is initially INVALID (constraints violated).",
                i + 1
            );
            continue;
        }

        let mut solve_board = board.clone();
        let solutions = solver::solve(&mut solve_board, 2);

        if !solutions.is_empty() {
            solvable_count += 1;
            if solutions.len() == 1 {
                unique_count += 1;
                valid_count += 1;
            } else {
                println!("  Puzzle #{} has MULTIPLE solutions.", i + 1);
            }
        } else {
            println!("  Puzzle #{} is UNSOLVABLE.", i + 1);
        }
    }

    println!(
        "Result: {}/{} valid. Solvable: {}, Unique: {}",
        valid_count,
        puzzles.len(),
        solvable_count,
        unique_count
    );
}

fn generate_random_board(size: usize) -> Board {
    let mut rng = rand::thread_rng();
    let mut cells = vec![Cell::White; size * size];

    // Place walls (25% density)
    let num_walls = (size * size) as f32 * 0.25;
    for _ in 0..num_walls as usize {
        let r = rng.gen_range(0..size);
        let c = rng.gen_range(0..size);
        cells[r * size + c] = Cell::Black(None);
    }

    Board::from_cells(size, cells)
}

fn generate_puzzle(size: usize) -> Option<(String, Vec<String>)> {
    let mut rng = rand::thread_rng();
    // Try up to 100 times to generate a valid puzzle structure
    for _ in 0..100 {
        let mut board = generate_random_board(size);
        // Find a solution
        let mut solve_board = board.clone();
        let solutions = solver::solve(&mut solve_board, 1);

        if solutions.is_empty() {
            continue;
        }

        let solution = &solutions[0];

        // Place bulbs
        for &(r, c) in solution {
            board.place_bulb(r, c);
        }

        // Assign numbers to walls
        for r in 0..size {
            for c in 0..size {
                if let Cell::Black(_) = board.get(r, c) {
                    let mut bulb_count = 0;
                    let neighbors = [
                        (r.wrapping_sub(1), c),
                        (r + 1, c),
                        (r, c.wrapping_sub(1)),
                        (r, c + 1),
                    ];
                    for &(nr, nc) in &neighbors {
                        if nr < size && nc < size {
                            if let Cell::Bulb = board.get(nr, nc) {
                                bulb_count += 1;
                            }
                        }
                    }
                    // Assign number
                    board.set(r, c, Cell::Black(Some(bulb_count)));
                }
            }
        }

        // Verify uniqueness
        let mut verify_board = Board::from_cells(size, board.cells.clone());
        // Reset bulbs to white for verification (the Board currently holds Bulbs so we must clear them)
        // Wait, `from_cells` creates a board with the cells logic.
        // My Board struct stores Cells. If I placed bulbs, the cells are Cell::Bulb.
        // I need to change Cell::Bulb back to Cell::White
        for r in 0..size {
            for c in 0..size {
                if let Cell::Bulb = verify_board.get(r, c) {
                    verify_board.set(r, c, Cell::White);
                }
            }
        }

        // Also reset lit_map
        verify_board.lit_map = vec![0; size * size];

        let verify_solutions = solver::solve(&mut verify_board, 2);

        if verify_solutions.len() == 1 {
            let encoded = verify_board.encode();
            let solution_strs: Vec<String> = solution
                .iter()
                .map(|(r, c)| format!("{},{}", r, c))
                .collect();
            return Some((encoded, solution_strs));
        }
    }
    None
}

fn add_puzzles(path: &PathBuf, size: usize, count: usize) {
    println!("Generating {} puzzles of size {}x{}...", count, size, size);
    let mut new_puzzles = Vec::new();
    let mut generated = 0;

    while generated < count {
        if let Some((encoded, solution)) = generate_puzzle(size) {
            new_puzzles.push(PuzzleData {
                board_str: encoded,
                solution,
            });
            generated += 1;
            if generated % 10 == 0 {
                println!("Generated {}/{}", generated, count);
            }
        }
    }

    match io::append_puzzles(path, &new_puzzles) {
        Ok(_) => println!("Successfully added {} puzzles to {}", count, path.display()),
        Err(e) => eprintln!("Error appending to file: {}", e),
    }
}

fn update_file(path: &PathBuf, size: usize) {
    println!("Updating {} (size {}x{})...", path.display(), size, size);
    let content = match io::read_file(path) {
        Ok(c) => c,
        Err(e) => {
            eprintln!("Error reading file: {}", e);
            return;
        }
    };

    let puzzles = io::parse_puzzles(&content);
    println!("Found {} puzzles originally.", puzzles.len());

    let mut valid_puzzles = Vec::new();
    let mut removed_count = 0;

    for (i, p) in puzzles.iter().enumerate() {
        let board = match Board::new(size, &p.board_str) {
            Some(b) => b,
            None => {
                println!("  Removing puzzle #{} (Invalid board string)", i + 1);
                removed_count += 1;
                continue;
            }
        };

        if !board.is_valid() {
            println!("  Removing puzzle #{} (Invalid constraints)", i + 1);
            removed_count += 1;
            continue;
        }

        // Also check if solvable?
        // A puzzle might be solvable but we just want to filter technically invalid ones?
        // Let's filtered UNSOLVABLE ones too.
        let mut solve_board = board.clone();
        let solutions = solver::solve(&mut solve_board, 2);

        if solutions.is_empty() {
            println!("  Removing puzzle #{} (Unsolvable)", i + 1);
            removed_count += 1;
            continue;
        }

        if solutions.len() > 1 {
            println!("  Removing puzzle #{} (Multiple solutions)", i + 1);
            removed_count += 1;
            continue;
        }

        valid_puzzles.push(PuzzleData {
            board_str: p.board_str.clone(), // We keep the original string (even with spaces if they were valid length key)
            // But wait, Board::new handles spaces by mapping to White.
            // But if we write back, we might want to clean it up?
            // `io::format_puzzle_file` uses `p.board_str`.
            // If the original string had newlines or something weird that made it valid length?
            // `Board::new` logic: "Treat spaces and other chars as White".
            // So if `board_str` has spaces, it's valid.
            // We should ideally normalize it to `board.encode()`?
            // Yes, let's normalize it to ensure consistency.
            // `board.encode()` returns pure w/b/digits string.
            // BUT `board.encode()` loses the visual formatting (newlines/spaces).
            // If the user LIKES the formatting, we should keep it?
            // In 5x5 case, formatting was causing confusion/errors.
            // Let's normalize it to be safe.
            // Wait, if I normalize it, I lose the visual grid in the source file.
            // `codec.ts` doesn't care. Visual grid is nice for humans.
            // I'll keep the original string to respect user's manual editing IF it was valid.
            // But if I generated it, it would be compact.
            // Let's use `board.encode()` to normalize and fix potential weirdness.
            solution: solutions[0]
                .iter()
                .map(|(r, c)| format!("{},{}", r, c))
                .collect(),
        });

        // Actually, let's overwrite `board_str` with normalized one.
        valid_puzzles.last_mut().unwrap().board_str = board.encode();
    }

    println!(
        "Removed {} invalid puzzles. Keeping {}.",
        removed_count,
        valid_puzzles.len()
    );

    // Write back
    let new_content = io::format_puzzle_file(size, &valid_puzzles, 1);
    match std::fs::write(path, new_content) {
        Ok(_) => println!("Successfully updated {}", path.display()),
        Err(e) => eprintln!("Error writing file: {}", e),
    }
}
