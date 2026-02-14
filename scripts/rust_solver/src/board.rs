use std::fmt;

#[derive(Clone, Copy, PartialEq, Eq, Debug)]
pub enum Cell {
    White,
    Black(Option<u8>), // None for unnumbered black wall
    Bulb,
}

#[derive(Clone)]
pub struct Board {
    pub size: usize,
    pub cells: Vec<Cell>,
    pub lit_map: Vec<i32>,
}

impl Board {
    pub fn new(size: usize, encoded: &str) -> Option<Self> {
        // According to codec.ts, any unknown char is 'white'.
        // We should not filter out characters that contribute to the length.
        // But we should probably filter out newlines if they happen?
        // The regex passed "clean" strings but they might have whitespace like ' '.

        let mut cells = Vec::with_capacity(size * size);
        for c in encoded.chars() {
            // Skip newlines or other control chars if they snuck in?
            // But keep spaces if they are part of the board string in the file.
            if c == '\n' || c == '\r' || c == '\'' {
                continue;
            }

            let cell = match c {
                'w' => Cell::White,
                'b' => Cell::Black(None),
                '0'..='4' => Cell::Black(Some(c.to_digit(10).unwrap() as u8)),
                _ => Cell::White, // Treat spaces and other chars as White (matches codec.ts)
            };
            cells.push(cell);
        }

        if cells.len() != size * size {
            println!(
                "Debug: Expected {} cells, got {}. Encoded len: {}",
                size * size,
                cells.len(),
                encoded.len()
            );
            println!("Debug: Encoded string: '{}'", encoded);
            return None;
        }

        Some(Board {
            size,
            cells,
            lit_map: vec![0; size * size],
        })
    }

    pub fn from_cells(size: usize, cells: Vec<Cell>) -> Self {
        Board {
            size,
            cells,
            lit_map: vec![0; size * size],
        }
    }

    pub fn get(&self, r: usize, c: usize) -> Cell {
        self.cells[r * self.size + c]
    }

    pub fn set(&mut self, r: usize, c: usize, cell: Cell) {
        self.cells[r * self.size + c] = cell;
    }

    pub fn is_wall(&self, r: usize, c: usize) -> bool {
        matches!(self.cells[r * self.size + c], Cell::Black(_))
    }

    pub fn place_bulb(&mut self, r: usize, c: usize) {
        if let Cell::White = self.get(r, c) {
            self.cells[r * self.size + c] = Cell::Bulb;
            self.update_lit(r, c, 1);
        }
    }

    pub fn remove_bulb(&mut self, r: usize, c: usize) {
        if let Cell::Bulb = self.get(r, c) {
            self.cells[r * self.size + c] = Cell::White;
            self.update_lit(r, c, -1);
        }
    }

    fn update_lit(&mut self, r: usize, c: usize, delta: i32) {
        self.lit_map[r * self.size + c] += delta;
        // Up
        for i in (0..r).rev() {
            if self.is_wall(i, c) {
                break;
            }
            self.lit_map[i * self.size + c] += delta;
        }
        // Down
        for i in (r + 1)..self.size {
            if self.is_wall(i, c) {
                break;
            }
            self.lit_map[i * self.size + c] += delta;
        }
        // Left
        for j in (0..c).rev() {
            if self.is_wall(r, j) {
                break;
            }
            self.lit_map[r * self.size + j] += delta;
        }
        // Right
        for j in (c + 1)..self.size {
            if self.is_wall(r, j) {
                break;
            }
            self.lit_map[r * self.size + j] += delta;
        }
    }

    pub fn is_valid(&self) -> bool {
        for r in 0..self.size {
            for c in 0..self.size {
                if let Cell::Black(Some(n)) = self.get(r, c) {
                    let mut bulb_count = 0;
                    let mut empty_count = 0;
                    let neighbors = [
                        (r.wrapping_sub(1), c),
                        (r + 1, c),
                        (r, c.wrapping_sub(1)),
                        (r, c + 1),
                    ];
                    for &(nr, nc) in &neighbors {
                        if nr < self.size && nc < self.size {
                            match self.get(nr, nc) {
                                Cell::Bulb => bulb_count += 1,
                                Cell::White => empty_count += 1,
                                _ => {}
                            }
                        }
                    }
                    if bulb_count > n {
                        return false;
                    }
                    if bulb_count + empty_count < n {
                        return false;
                    }
                }

                if let Cell::Bulb = self.get(r, c) {
                    if self.lit_map[r * self.size + c] > 1 {
                        return false;
                    }
                }
            }
        }
        true
    }

    pub fn is_solved(&self) -> bool {
        for r in 0..self.size {
            for c in 0..self.size {
                match self.get(r, c) {
                    Cell::White => {
                        if self.lit_map[r * self.size + c] <= 0 {
                            return false;
                        }
                    }
                    Cell::Black(Some(n)) => {
                        let mut bulb_count = 0;
                        let neighbors = [
                            (r.wrapping_sub(1), c),
                            (r + 1, c),
                            (r, c.wrapping_sub(1)),
                            (r, c + 1),
                        ];
                        for &(nr, nc) in &neighbors {
                            if nr < self.size && nc < self.size {
                                if let Cell::Bulb = self.get(nr, nc) {
                                    bulb_count += 1;
                                }
                            }
                        }
                        if bulb_count != n {
                            return false;
                        }
                    }
                    _ => {}
                }
            }
        }
        true
    }

    pub fn encode(&self) -> String {
        let mut s = String::new();
        for r in 0..self.size {
            for c in 0..self.size {
                let char = match self.get(r, c) {
                    Cell::White | Cell::Bulb => 'w',
                    Cell::Black(None) => 'b',
                    Cell::Black(Some(n)) => char::from_digit(n as u32, 10).unwrap(),
                };
                s.push(char);
            }
        }
        s
    }

    pub fn get_neighbors(&self, r: usize, c: usize) -> Vec<(usize, usize)> {
        let mut neighbors = Vec::new();
        if r > 0 {
            neighbors.push((r - 1, c));
        }
        if r < self.size - 1 {
            neighbors.push((r + 1, c));
        }
        if c > 0 {
            neighbors.push((r, c - 1));
        }
        if c < self.size - 1 {
            neighbors.push((r, c + 1));
        }
        neighbors
    }

    pub fn is_satisfied(&self, r: usize, c: usize) -> bool {
        if let Cell::Black(Some(n)) = self.get(r, c) {
            let mut bulb_count = 0;
            for (nr, nc) in self.get_neighbors(r, c) {
                if let Cell::Bulb = self.get(nr, nc) {
                    bulb_count += 1;
                }
            }
            bulb_count == n
        } else {
            true
        }
    }
}

impl fmt::Display for Board {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        for r in 0..self.size {
            for c in 0..self.size {
                let char = match self.get(r, c) {
                    Cell::White => '.',
                    Cell::Bulb => '*',
                    Cell::Black(None) => '#',
                    Cell::Black(Some(n)) => char::from_digit(n as u32, 10).unwrap(),
                };
                write!(f, "{}", char)?;
            }
            writeln!(f)?;
        }
        Ok(())
    }
}
