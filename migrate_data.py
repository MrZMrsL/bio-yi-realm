import os
import re

OLD_DIR = r'D:\我的超级龙虾\games\生化易界_v4'
NEW_DIR = r'D:\我的超级龙虾\games\生化易界-vue\src\data'

def find_matching_bracket(text, start_idx, open_char='[', close_char=']'):
    """Find matching closing bracket from start position"""
    count = 0
    in_string = False
    string_char = None
    escape = False
    
    i = start_idx
    while i < len(text):
        char = text[i]
        if escape:
            escape = False
            i += 1
            continue
        if char == '\\':
            escape = True
            i += 1
            continue
        if not in_string and char in ('"', "'", '`'):
            in_string = True
            string_char = char
            i += 1
            continue
        if in_string and char == string_char:
            in_string = False
            string_char = None
            i += 1
            continue
        if not in_string:
            if char == open_char:
                count += 1
            elif char == close_char:
                count -= 1
                if count == 0:
                    return i
        i += 1
    return -1

def convert_js_to_esmodule(filepath, newpath, new_var_name):
    """Simple conversion: replace 'const X = [' with 'export const Y = ['"""
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Find the const declaration
    pattern = r'const\s+([A-Z_][A-Z_0-9]*)\s*='
    match = re.search(pattern, content)
    if not match:
        print(f"  [WARN] No const found in {os.path.basename(filepath)}")
        return False
    
    old_var_name = match.group(1)
    
    # Replace the variable name and add export
    new_content = content.replace(
        f'const {old_var_name} =',
        f'export const {new_var_name} =',
        1  # Only replace first occurrence
    )
    
    # Remove any trailing semicolons after the closing bracket (if present)
    # Actually, JS files don't have semicolons at the end usually
    
    with open(newpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    # Count items (rough count by finding 'q:' or 'name:')
    count = new_content.count('"q":') + new_content.count("'q':") + new_content.count('q:')
    if count == 0:
        count = new_content.count('"name":') + new_content.count("'name':") + new_content.count('name:')
    if count > 100:  # Probably overcounted due to nested objects
        count = new_content.count('{ q:') + new_content.count('{ q:')
    
    print(f"  [OK] {new_var_name} -> {os.path.basename(newpath)}")
    return True

def extract_from_data_js(line_start, line_end, new_var_name, newpath):
    """Extract a range from data.js and convert to ES module"""
    filepath = os.path.join(OLD_DIR, 'data.js')
    with open(filepath, 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    # Extract lines (1-indexed to 0-indexed)
    chunk = ''.join(lines[line_start-1:line_end])
    
    # Find the const declaration in this chunk
    pattern = r'const\s+([A-Z_][A-Z_0-9]*)\s*='
    match = re.search(pattern, chunk)
    if not match:
        print(f"  [WARN] No const found in data.js lines {line_start}-{line_end}")
        return False
    
    old_var_name = match.group(1)
    
    # Replace with export const
    new_content = chunk.replace(
        f'const {old_var_name} =',
        f'export const {new_var_name} =',
        1
    )
    
    with open(newpath, 'w', encoding='utf-8') as f:
        f.write(new_content)
    
    print(f"  [OK] {new_var_name} -> {os.path.basename(newpath)}")
    return True

print("=" * 50)
print("Start migration...")
print("=" * 50)

# Chemistry
print("\n[Chemistry]")
convert_js_to_esmodule(os.path.join(OLD_DIR, 'chem_easy_40.js'), 
                        os.path.join(NEW_DIR, 'chem_easy.js'), 'CHEM_EASY')
convert_js_to_esmodule(os.path.join(OLD_DIR, 'chem_medium_40_1.js'), 
                        os.path.join(NEW_DIR, 'chem_medium_1.js'), 'CHEM_MEDIUM_1')
convert_js_to_esmodule(os.path.join(OLD_DIR, 'chem_medium_40_2.js'), 
                        os.path.join(NEW_DIR, 'chem_medium_2.js'), 'CHEM_MEDIUM_2')

# Biology
print("\n[Biology]")
convert_js_to_esmodule(os.path.join(OLD_DIR, 'bio_easy_40.js'), 
                        os.path.join(NEW_DIR, 'bio_easy.js'), 'BIO_EASY')
convert_js_to_esmodule(os.path.join(OLD_DIR, 'bio_medium_80.js'), 
                        os.path.join(NEW_DIR, 'bio_medium.js'), 'BIO_MEDIUM')

# Hard from data.js (need to verify line ranges)
print("\n[Hard from data.js]")
extract_from_data_js(1, 30, 'BIO_HARD', os.path.join(NEW_DIR, 'bio_hard.js'))
extract_from_data_js(31, 229, 'CHEM_HARD', os.path.join(NEW_DIR, 'chem_hard.js'))

# YiJing
print("\n[YiJing]")
convert_js_to_esmodule(os.path.join(OLD_DIR, 'yi_add_8.js'), 
                        os.path.join(NEW_DIR, 'yi_medium.js'), 'YI_MEDIUM')

# Enemies (object format)
print("\n[Enemies]")
convert_js_to_esmodule(os.path.join(OLD_DIR, 'enemies_add.js'), 
                        os.path.join(NEW_DIR, 'enemies_extra.js'), 'EXTRA_ENEMIES')

print("\n" + "=" * 50)
print("Migration complete!")
print("=" * 50)
