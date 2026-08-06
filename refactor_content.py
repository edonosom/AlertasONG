import os
import re

directory = 'src'

replacements = [
    (r'\bPaciente\b', 'Nna'),
    (r'\bpaciente\b', 'nna'),
    (r'\bPacientes\b', 'Nnas'),
    (r'\bpacientes\b', 'nnas'),
    (r'\bPACIENTE\b', 'NNA'),
    (r'\bPACIENTES\b', 'NNAS'),
    (r'\bPacienteModalComponent\b', 'NnaModalComponent'),
    (r'\bpaciente-modal\b', 'nna-modal'),
    (r'\bPacienteCardComponent\b', 'NnaCardComponent'),
    (r'\bpaciente-card\b', 'nna-card'),
    (r'\bPacienteFormComponent\b', 'NnaFormComponent'),
    (r'\bpaciente-form\b', 'nna-form'),
    (r'\bpaciente\.service\b', 'nna.service'),
]

for root, dirs, files in os.walk(directory):
    for file in files:
        if file.endswith('.ts') or file.endswith('.html') or file.endswith('.scss'):
            filepath = os.path.join(root, file)
            try:
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content
                for pattern, repl in replacements:
                    new_content = re.sub(pattern, repl, new_content)
                
                if new_content != content:
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)
                    print(f"Updated content in {filepath}")
            except Exception as e:
                print(f"Error reading {filepath}: {e}")
