import os

directory = 'src'

def rename_recursively(dir_path):
    # Rename files in the current directory first
    for filename in os.listdir(dir_path):
        filepath = os.path.join(dir_path, filename)
        if os.path.isfile(filepath):
            if 'paciente' in filename:
                new_filename = filename.replace('paciente', 'nna')
                new_filepath = os.path.join(dir_path, new_filename)
                os.rename(filepath, new_filepath)
                print(f"Renamed {filepath} to {new_filepath}")
            elif 'Paciente' in filename:
                new_filename = filename.replace('Paciente', 'Nna')
                new_filepath = os.path.join(dir_path, new_filename)
                os.rename(filepath, new_filepath)
                print(f"Renamed {filepath} to {new_filepath}")

    # Now recursively call for directories
    for dirname in os.listdir(dir_path):
        dirpath = os.path.join(dir_path, dirname)
        if os.path.isdir(dirpath):
            # Recurse first before renaming the directory itself
            rename_recursively(dirpath)
            
            # Now rename the directory if it contains 'paciente'
            if 'paciente' in dirname:
                new_dirname = dirname.replace('paciente', 'nna')
                new_dirpath = os.path.join(dir_path, new_dirname)
                os.rename(dirpath, new_dirpath)
                print(f"Renamed {dirpath} to {new_dirpath}")
            elif 'Paciente' in dirname:
                new_dirname = dirname.replace('Paciente', 'Nna')
                new_dirpath = os.path.join(dir_path, new_dirname)
                os.rename(dirpath, new_dirpath)
                print(f"Renamed {dirpath} to {new_dirpath}")

rename_recursively(directory)
