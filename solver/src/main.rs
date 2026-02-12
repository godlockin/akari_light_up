use std::collections::HashSet;
use std::env;
use std::time::Instant;

#[derive(Clone, Copy, PartialEq, Eq, Hash, Debug)]
pub enum CellType {
    White, Black, Black0, Black1, Black2, Black3, Black4,
}

impl CellType {
    fn from_char(c: char) -> Self {
        match c {
            'w' | '.' => CellType::White,
            'b' | '#' => CellType::Black,
            '0' => CellType::Black0,
            '1' => CellType::Black1,
            '2' => CellType::Black2,
            '3' => CellType::Black3,
            '4' => CellType::Black4,
            _ => CellType::White,
        }
    }

    fn is_black(&self) -> bool {
        !matches!(self, CellType::White)
    }
}

#[derive(Clone)]
pub struct Puzzle {
    pub size: usize,
    pub grid: Vec<Vec<CellType>>,
}

impl Puzzle {
    pub fn new(size: usize, encoded: &str) -> Self {
        let mut grid = vec![vec![CellType::White; size]; size];
        let chars: Vec<char> = encoded.chars().collect();
        for i in 0..size {
            for j in 0..size {
                let idx = i * size + j;
                if idx < chars.len() {
                    grid[i][j] = CellType::from_char(chars[idx]);
                }
            }
        }
        Puzzle { size, grid }
    }

    pub fn print(&self) {
        for row in &self.grid {
            for cell in row {
                let c = match cell {
                    CellType::White => '.',
                    CellType::Black => '#',
                    CellType::Black0 => '0',
                    CellType::Black1 => '1',
                    CellType::Black2 => '2',
                    CellType::Black3 => '3',
                    CellType::Black4 => '4',
                };
                print!("{} ", c);
            }
            println!();
        }
    }
}

#[derive(Debug, Clone)]
pub struct Solution {
    pub bulbs: Vec<(usize, usize)>,
    pub bulb_count: usize,
}

#[derive(Debug, Clone)]
pub struct SolverStats {
    pub backtrack_steps: usize,
    pub propagate_calls: usize,
    pub max_depth: usize,
}

#[derive(Debug)]
pub struct SolverResult {
    pub solvable: bool,
    pub unique: bool,
    pub solution_count: usize,
    pub solution: Option<Solution>,
    pub stats: SolverStats,
}

pub struct Solver {
    puzzle: Puzzle,
    directions: [(i32, i32); 4],
    stats: SolverStats,
    timeout: Option<u128>,
    start_time: Instant,
    max_solutions: usize,
    solution_count: usize,
    solutions: Vec<Solution>,
}

impl Solver {
    pub fn new(puzzle: Puzzle) -> Self {
        Solver {
            puzzle,
            directions: [(-1, 0), (1, 0), (0, -1), (0, 1)],
            stats: SolverStats {
                backtrack_steps: 0,
                propagate_calls: 0,
                max_depth: 0,
            },
            timeout: None,
            start_time: Instant::now(),
            max_solutions: 1,
            solution_count: 0,
            solutions: Vec::new(),
        }
    }

    pub fn with_timeout(mut self, timeout_ms: u64) -> Self {
        self.timeout = Some(timeout_ms as u128);
        self
    }

    pub fn with_max_solutions(mut self, max: usize) -> Self {
        self.max_solutions = max;
        self
    }

    pub fn solve(&mut self) -> SolverResult {
        let size = self.puzzle.size;

        // 简化的搜索 - 直接遍历所有可能的灯泡放置
        let mut best_result: Option<(Vec<(usize, usize)>, SolverStats)> = None;
        let mut found_solutions: Vec<Solution> = Vec::new();
        let max_iterations = 200000;

        for iteration in 0..max_iterations {
            // 随机初始状态
            let mut bulbs: Vec<(usize, usize)> = Vec::new();
            let mut positions: Vec<(usize, usize)> = Vec::new();
            for i in 0..size {
                for j in 0..size {
                    if self.puzzle.grid[i][j] == CellType::White {
                        positions.push((i, j));
                    }
                }
            }

            // 随机打乱位置顺序
            use std::collections::hash_map::DefaultHasher;
            let mut rng = std::cell::RefCell::new(rand::thread_rng());
            positions.shuffle(&mut rng);

            let mut placed_count = 0;

            // 尝试放置灯泡
            for (row, col) in &positions {
                if placed_count >= size {
                    break;
                }

                if !self.can_place_bulb(&bulbs, row, col) {
                    continue;
                }

                bulbs.push((row, col));
                placed_count += 1;

                if placed_count >= size {
                    break;
                }
            }

            if placed_count < size {
                continue;
            }

            // 检查是否有效解
            if self.is_valid_solution(&bulbs, size) {
                let mut bulb_vec = bulbs.clone();
                bulb_vec.sort();

                found_solutions.push(Solution {
                    bulbs: bulb_vec.clone(),
                    bulb_count: bulb_vec.len(),
                });

                if found_solutions.len() >= self.max_solutions {
                    break;
                }
            }
        }

        if found_solutions.is_empty() {
            return SolverResult {
                solvable: false,
                unique: false,
                solution_count: 0,
                solution: None,
                stats: self.stats.clone(),
            };
        }

        self.stats.backtrack_steps = iteration * positions.len();
        let solution = if found_solutions.len() == 1 {
            Some(found_solutions[0].clone())
        } else {
            None
        };

        SolverResult {
            solvable: true,
            unique: found_solutions.len() == 1,
            solution_count: found_solutions.len(),
            solution,
            stats: self.stats.clone(),
        }
    }

    fn can_place_bulb(&self, bulbs: &Vec<(usize, usize)>, row: usize, col: usize) -> bool {
        for (dr, dc) in self.directions {
            let mut r = row as i32 + dr;
            let mut c = col as i32 + dc;

            while r >= 0 && r < self.puzzle.size as i32 && c >= 0 && c < self.puzzle.size as i32 {
                if self.puzzle.grid[r as usize][c as usize].is_black() {
                    break;
                }

                if bulbs.contains(&(r as usize, c as usize)) {
                    return false;
                }

                r += dr;
                c += dc;
            }
        }

        true
    }

    fn is_valid_solution(&self, bulbs: &Vec<(usize, usize)>, size: usize) -> bool {
        // 检查灯泡冲突
        let bulb_set: HashSet<(usize, usize)> = bulbs.iter().cloned().collect();
        for &(row, col) in bulbs {
            if self.can_place_bulb(&bulbs, row, col) {
                return false;
            }
        }

        // 检查所有白格是否被照亮
        let mut illuminated = HashSet::new();
        for &(row, col) in bulbs {
            illuminated.insert((row, col));
            for (dr, dc) in self.directions {
                let mut r = row as i32 + dr;
                let mut c = col as i32 + dc;
                while r >= 0 && r < size as i32 && c >= 0 && c < size as i32 {
                    if self.puzzle.grid[r as usize][c as usize].is_black() {
                        break;
                    }
                    illuminated.insert((r as usize, c as usize));
                    r += dr;
                    c += dc;
                }
            }
        }

        // 检查数字约束
        for &(row, col) in bulb_set {
            if let Some(num) = self.puzzle.grid[row][col].get_number() {
                let mut count = 0;
                for (dr, dc) in self.directions {
                    let r = row as i32 + dr;
                    let c = col as i32 + dc;
                    if r >= 0 && r < size as i32 && c >= 0 && c < size as i32 {
                        if self.puzzle.grid[r as usize][c as usize] == CellType::White {
                            if bulb_set.contains(&(r as usize, c as usize)) {
                                count += 1;
                            }
                        }
                    }
                }
                if count > num {
                    return false;
                }
            }
        }

        true
    }
}

fn print_solution(puzzle: &Puzzle, solution: &Solution) {
    let bulb_set: HashSet<(usize, usize)> = solution.bulbs.iter().cloned().collect();

    for row in 0..puzzle.size {
        for col in 0..puzzle.size {
            if bulb_set.contains(&(row, col)) {
                print!("* ");
            } else {
                let cell = puzzle.grid[row][col];
                let c = match cell {
                    CellType::White => '.',
                    CellType::Black => '#',
                    CellType::Black0 => '0',
                    CellType::Black1 => '1',
                    CellType::Black2 => '2',
                    CellType::Black3 => '3',
                    CellType::Black4 => '4',
                };
                print!("{} ", c);
            }
        }
        println!();
    }
}

fn main() {
    let args: Vec<String> = env::args().collect();

    if args.len() < 3 {
        println!("Akari Light Up 求解器");
        println!("用法: {} <编码字符串> <大小> [选项]", args[0]);
        println!();
        println!("选项:");
        println!("  --show-board      显示棋盘");
        println!("  --show-solution  显示解");
        println!("  --max-solutions <n>  最多找 n 个解");
        println!("  --timeout <ms>    超时时间（毫秒）");
        println!();
        println!("示例:");
        println!("  {} wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww 7", args[0]);
        println!("  {} wwbwbwwb3bw0bwwwwwbwwwb4bwwbwwbwwbwb0bwb2bwwwwwww 7 --show-solution", args[0]);
        std::process::exit(0);
    }

    let encoded = &args[1];
    let size: usize = args[2].parse().expect("无效的大小");

    let mut show_board = false;
    let mut show_solution = false;
    let mut max_solutions = 1;
    let mut timeout: Option<u64> = None;

    let mut i = 3;
    while i < args.len() {
        match args[i].as_str() {
            "--show-board" => show_board = true,
            "--show-solution" => show_solution = true,
            "--max-solutions" => {
                if i + 1 < args.len() {
                    max_solutions = args[i + 1].parse().expect("无效的最大解数");
                    i += 1;
                }
            }
            "--timeout" => {
                if i + 1 < args.len() {
                    timeout = Some(args[i + 1].parse().expect("无效的超时时间"));
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }

    let puzzle = Puzzle::new(size, encoded);

    if show_board {
        println!("棋盘:");
        puzzle.print();
        println!();
    }

    println!("开始求解...");
    let start = Instant::now();

    let mut solver = Solver::new(puzzle);
    if let Some(t) = timeout {
        solver = solver.with_timeout(t);
    }
    solver = solver.with_max_solutions(max_solutions);

    let result = solver.solve();
    let elapsed = start.elapsed();

    println!();
    println!("结果:");
    println!("  可解: {}", if result.solvable { "是" } else { "否" });
    println!("  唯一解: {}", if result.unique { "是" } else { "否" });
    println!("  解的数量: {}", result.solution_count);
    println!("  用时: {:?}", elapsed);
    println!();
    println!("统计信息:");
    println!("  回溯步数: {}", result.stats.backtrack_steps);
    println!("  传播调用: {}", result.stats.propagate_calls);
    println!("  最大深度: {}", result.stats.max_depth);

    if let Some(ref solution) = result.solution {
        println!("  灯泡数量: {}", solution.bulb_count);
        println!("  灯泡位置: {:?}", solution.bulbs);
    }

    if show_solution {
        if let Some(ref solution) = result.solution {
            println!();
            println!("解:");
            print_solution(&puzzle, solution);
        }
    }
}
