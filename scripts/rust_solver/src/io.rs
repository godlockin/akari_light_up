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
