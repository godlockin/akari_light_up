use regex::Regex;
use std::fs;
use std::io::{self, Write};
use std::path::Path;

pub struct PuzzleData {
    pub board_str: String,
    pub solution: Vec<String>,
}

pub fn parse_puzzles(content: &str) -> Vec<PuzzleData> {
    // Regex to match { b: '...', s: [...] }
    // Handles formatted strings with whitespace
    // Note: The s: [...] part might span multiple lines if formatted
    let re = Regex::new(r"\{[\s\n]*b:\s*'([^']+)'[\s\S]*?s:\s*\[([^\]]*)\]").unwrap();

    let mut puzzles = Vec::new();
    for cap in re.captures_iter(content) {
        let board_str = cap[1].to_string();
        let sol_raw = &cap[2];

        let solution: Vec<String> = Regex::new(r#"['"]([^'"]+)['"]"#)
            .unwrap()
            .captures_iter(sol_raw)
            .map(|c| c[1].to_string())
            .collect();

        puzzles.push(PuzzleData {
            board_str,
            solution,
        });
    }
    puzzles
}

pub fn read_file(path: &Path) -> Result<String, std::io::Error> {
    fs::read_to_string(path)
}

pub fn format_puzzle_file(size: usize, puzzles: &[PuzzleData], _difficulty_start: usize) -> String {
    let mut out = String::new();
    out.push_str("import { UltraCompactPuzzle } from './codec';\n\n");
    out.push_str(&format!("// {}x{} Puzzle Collection\n", size, size));
    out.push_str(&format!(
        "export const PUZZLES_{}X{}: UltraCompactPuzzle[] = [\n",
        size, size
    ));

    for (i, p) in puzzles.iter().enumerate() {
        if i == 0 {
            out.push_str("  // ===== Level 1 =====\n");
        }

        // Format board string slightly if needed, but keeping it raw is safer for now
        // The original file used quotes for board strings.

        // Format solution array
        let sol_str = p
            .solution
            .iter()
            .map(|s| format!("'{}'", s))
            .collect::<Vec<_>>()
            .join(",");

        out.push_str(&format!(
            "  {{ b: '{}', s: [{}] }},\n",
            p.board_str, sol_str
        ));
    }
    out.push_str("];\n");
    out
}

pub fn append_puzzles(path: &Path, new_puzzles: &[PuzzleData]) -> Result<(), std::io::Error> {
    if !path.exists() {
        // Create new file
        let size_str = path.file_stem().and_then(|s| s.to_str()).unwrap_or("10x10"); // Fallback, though we should probably parse from filename or pass size

        // Improve: The io::append_puzzles signature doesn't take size, but format_puzzle_file needs it.
        // We can try to parse it from the filename or just use a default/error.
        // Actually, let's just parse "12x12" from filename "12x12.ts"
        let size = if size_str.contains('x') {
            size_str.split('x').next().unwrap().parse().unwrap_or(10)
        } else {
            // Try to guess from the board string length of the first puzzle?
            let len = new_puzzles[0].board_str.len();
            (len as f64).sqrt() as usize
        };

        let content = format_puzzle_file(size, new_puzzles, 1);
        // Create directory if missing
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        fs::write(path, content)?;
        return Ok(());
    }

    // Read existing file
    let content = fs::read_to_string(path)?;

    // Find the end of the array `];`
    let last_bracket = content.rfind("];").ok_or(std::io::Error::new(
        std::io::ErrorKind::Other,
        "Could not find closing bracket",
    ))?;

    let mut file = fs::File::create(path)?; // Overwrite mode, but we will write back modified content

    // Write everything up to the closing bracket
    file.write_all(content[..last_bracket].as_bytes())?;

    // Write new puzzles
    for p in new_puzzles {
        let sol_str = p
            .solution
            .iter()
            .map(|s| format!("'{}'", s))
            .collect::<Vec<_>>()
            .join(",");
        writeln!(file, "  {{ b: '{}', s: [{}] }},", p.board_str, sol_str)?;
    }

    // Write closing bracket and whatever was after (usually newline)
    file.write_all(content[last_bracket..].as_bytes())?;

    Ok(())
}
