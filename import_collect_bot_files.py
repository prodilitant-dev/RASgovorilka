import os
import sys
import json
import zipfile
from datetime import datetime

# Пытаемся импортировать pick для красивого меню
try:
    from pick import pick
    HAS_PICK = True
except ImportError:
    HAS_PICK = False

# ----------------------------------------------------------------------
# Вспомогательные функции
# ----------------------------------------------------------------------

def find_project_root(start_path=None):
    if start_path is None:
        start_path = os.path.dirname(os.path.abspath(__file__))
    markers = ['.git', 'pyproject.toml', 'setup.py', 'requirements.txt']
    current = os.path.abspath(start_path)
    while True:
        for marker in markers:
            if os.path.exists(os.path.join(current, marker)):
                return current
        parent = os.path.dirname(current)
        if parent == current:
            break
        current = parent
    return start_path

def get_exclude_lists(output_filename):
    """Возвращает наборы исключаемых папок и файлов."""
    exclude_dirs = {'venv', '.venv', 'env', '.env', '__pycache__', '.git', '.idea', '.vscode', 'node_modules'}
    script_name = os.path.basename(__file__)
    exclude_files = {'.env', output_filename, script_name,
                     'package-lock.json', 'yarn.lock', 'pnpm-lock.yaml'}
    return exclude_dirs, exclude_files

# ----------------------------------------------------------------------
# Функции сборки
# ----------------------------------------------------------------------

def build_tree(root_path, exclude_dirs, exclude_files):
    """Рекурсивное построение дерева для JSON."""
    tree = {}
    total_files = 0
    total_size = 0
    for item in os.listdir(root_path):
        item_path = os.path.join(root_path, item)
        if item.startswith('.') or item in exclude_dirs or item in exclude_files:
            continue
        if os.path.isdir(item_path):
            sub_tree, sub_files, sub_size = build_tree(item_path, exclude_dirs, exclude_files)
            if sub_tree:
                tree[item] = sub_tree
                total_files += sub_files
                total_size += sub_size
        else:
            try:
                with open(item_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                stat = os.stat(item_path)
                tree[item] = {
                    'content': content,
                    'size': stat.st_size,
                    'mtime': datetime.fromtimestamp(stat.st_mtime).isoformat()
                }
                total_files += 1
                total_size += stat.st_size
            except (UnicodeDecodeError, PermissionError, OSError):
                continue
    return tree, total_files, total_size

def save_json(output_filename, project_root):
    """Сборка проекта в JSON."""
    project_root = os.path.abspath(project_root)
    exclude_dirs, exclude_files = get_exclude_lists(output_filename)
    tree, total_files, total_size = build_tree(project_root, exclude_dirs, exclude_files)
    result = {
        'project_root': project_root,
        'generated': datetime.now().isoformat(),
        'total_files': total_files,
        'total_size': total_size,
        'tree': tree
    }
    with open(output_filename, 'w', encoding='utf-8') as f:
        json.dump(result, f, ensure_ascii=False, indent=2)
    print(f"✅ Дерево сохранено в {output_filename} (JSON)")
    print(f"📁 Корень проекта: {project_root}")
    print(f"📄 Всего файлов: {total_files}, размер: {total_size} байт")

def save_txt(output_filename, project_root):
    """Сборка проекта в TXT (плоский список)."""
    project_root = os.path.abspath(project_root)
    exclude_dirs, exclude_files = get_exclude_lists(output_filename)
    files_data = []
    total_files = 0
    total_size = 0
    for root, dirs, files in os.walk(project_root):
        dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
        for filename in files:
            if filename.startswith('.') or filename in exclude_files:
                continue
            file_path = os.path.join(root, filename)
            rel_path = os.path.relpath(file_path, project_root)
            try:
                with open(file_path, 'r', encoding='utf-8') as infile:
                    content = infile.read()
                stat = os.stat(file_path)
                files_data.append((rel_path, content))
                total_files += 1
                total_size += stat.st_size
            except (UnicodeDecodeError, PermissionError, OSError):
                continue

    with open(output_filename, 'w', encoding='utf-8') as outfile:
        outfile.write(f"# Project root: {project_root}\n")
        outfile.write(f"# Generated: {datetime.now().isoformat()}\n")
        outfile.write(f"# Total files: {total_files}\n\n")
        for rel_path, content in files_data:
            outfile.write(f"# {rel_path}\n")
            outfile.write(content)
            outfile.write("\n\n")

    print(f"✅ TXT сохранён в {output_filename}")
    print(f"📁 Корень проекта: {project_root}")
    print(f"📄 Всего файлов: {total_files}, размер: {total_size} байт")

def save_zip(output_filename, project_root):
    """Сборка проекта в ZIP (включая бинарные файлы)."""
    project_root = os.path.abspath(project_root)
    exclude_dirs, exclude_files = get_exclude_lists(output_filename)
    total_files = 0
    total_size = 0
    with zipfile.ZipFile(output_filename, 'w', zipfile.ZIP_DEFLATED) as zipf:
        for root, dirs, files in os.walk(project_root):
            dirs[:] = [d for d in dirs if d not in exclude_dirs and not d.startswith('.')]
            for filename in files:
                if filename.startswith('.') or filename in exclude_files:
                    continue
                file_path = os.path.join(root, filename)
                rel_path = os.path.relpath(file_path, project_root)
                try:
                    zipf.write(file_path, rel_path)
                    stat = os.stat(file_path)
                    total_files += 1
                    total_size += stat.st_size
                except (PermissionError, OSError):
                    continue
    print(f"✅ ZIP-архив сохранён в {output_filename}")
    print(f"📁 Корень проекта: {project_root}")
    print(f"📄 Всего файлов: {total_files}, размер: {total_size} байт")

# ----------------------------------------------------------------------
# Функции извлечения
# ----------------------------------------------------------------------

def extract_json(json_file, target_dir):
    """Извлечение проекта из JSON-файла."""
    with open(json_file, 'r', encoding='utf-8') as f:
        data = json.load(f)
    tree = data.get('tree', {})
    if not tree:
        print("❌ В JSON нет дерева файлов.")
        return
    # Создаём целевую папку
    os.makedirs(target_dir, exist_ok=True)
    total_files = 0

    def _extract_node(node, current_path):
        nonlocal total_files
        for name, content in node.items():
            item_path = os.path.join(current_path, name)
            if isinstance(content, dict) and 'content' in content:
                # Это файл
                os.makedirs(os.path.dirname(item_path), exist_ok=True)
                with open(item_path, 'w', encoding='utf-8') as f:
                    f.write(content['content'])
                total_files += 1
            else:
                # Это папка (вложенный словарь без 'content')
                os.makedirs(item_path, exist_ok=True)
                _extract_node(content, item_path)

    _extract_node(tree, target_dir)
    print(f"✅ Извлечено файлов: {total_files} в {target_dir}")

def extract_zip(zip_file, target_dir):
    """Извлечение ZIP-архива."""
    with zipfile.ZipFile(zip_file, 'r') as zipf:
        zipf.extractall(target_dir)
    print(f"✅ ZIP-архив извлечён в {target_dir}")

# ----------------------------------------------------------------------
# Интерактивное меню (с поддержкой pick, если установлена)
# ----------------------------------------------------------------------

def get_user_choice(options, title="Выберите действие:"):
    """Универсальный выбор: если есть pick, используем стрелки, иначе цифры."""
    if HAS_PICK:
        option, _ = pick(options, title, indicator='=>')
        return option
    else:
        print(title)
        for i, opt in enumerate(options, 1):
            print(f"  {i}. {opt}")
        while True:
            try:
                choice = int(input("Введите номер пункта: ").strip())
                if 1 <= choice <= len(options):
                    return options[choice-1]
                else:
                    print(f"❌ Введите число от 1 до {len(options)}")
            except ValueError:
                print("❌ Введите число")

def interactive_menu():
    print("\n🔧 ИНТЕРАКТИВНЫЙ СБОРЩИК / ИЗВЛЕКАТЕЛЬ ПРОЕКТА 🔧\n")

    while True:
        main_options = [
            "Собрать проект в JSON",
            "Собрать проект в TXT",
            "Собрать проект в ZIP",
            "Извлечь из JSON",
            "Извлечь из ZIP",
            "Выход"
        ]
        choice = get_user_choice(main_options, "Главное меню:")

        if choice == "Выход":
            print("До свидания!")
            break

        # Сборка
        if choice.startswith("Собрать"):
            # Определяем корень
            default_root = find_project_root()
            print(f"\nАвтоматически определён корень проекта: {default_root}")
            root_input = input("Использовать этот корень? (y/n, по умолчанию y): ").strip().lower()
            if root_input == 'n':
                custom_root = input("Введите путь к корню проекта: ").strip()
                if os.path.isdir(custom_root):
                    project_root = custom_root
                else:
                    print("❌ Указанный путь не является директорией. Использую автоопределённый.")
                    project_root = default_root
            else:
                project_root = default_root

            # Определяем расширение и формат
            if choice.endswith("JSON"):
                ext = '.json'
            elif choice.endswith("TXT"):
                ext = '.txt'
            else:  # ZIP
                ext = '.zip'

            # Имя файла
            base_name = os.path.basename(project_root)
            default_name = f"{base_name}{ext}"
            print(f"\nПредлагаемое имя выходного файла: {default_name}")
            custom_name = input("Введите своё имя файла (или оставьте пустым): ").strip()
            output_filename = custom_name if custom_name else default_name

            # Проверка существования
            if os.path.exists(output_filename):
                overwrite = input(f"Файл {output_filename} уже существует. Перезаписать? (y/n, по умолчанию n): ").strip().lower()
                if overwrite != 'y':
                    print("❌ Операция отменена.")
                    continue

            print("\n⏳ Сборка...")
            if ext == '.json':
                save_json(output_filename, project_root)
            elif ext == '.txt':
                save_txt(output_filename, project_root)
            else:
                save_zip(output_filename, project_root)
            print("✅ Готово!\n")

        # Извлечение
        elif choice.startswith("Извлечь из JSON"):
            json_path = input("Введите путь к JSON-файлу: ").strip()
            if not os.path.isfile(json_path):
                print("❌ Файл не найден.")
                continue
            target_dir = input("Введите папку для извлечения (по умолчанию ./extracted_json): ").strip()
            if not target_dir:
                target_dir = "./extracted_json"
            extract_json(json_path, target_dir)
            print()

        elif choice.startswith("Извлечь из ZIP"):
            zip_path = input("Введите путь к ZIP-файлу: ").strip()
            if not os.path.isfile(zip_path):
                print("❌ Файл не найден.")
                continue
            target_dir = input("Введите папку для извлечения (по умолчанию ./extracted_zip): ").strip()
            if not target_dir:
                target_dir = "./extracted_zip"
            extract_zip(zip_path, target_dir)
            print()

# ----------------------------------------------------------------------
# Неинтерактивный режим (для вызова с аргументами)
# ----------------------------------------------------------------------

def non_interactive_mode():
    """Обработка аргументов командной строки."""
    args = sys.argv[1:]
    if len(args) < 1:
        print("Использование:")
        print("  python script.py <выходной_файл> [корень_проекта]")
        print("  Расширение определяет формат: .json, .txt, .zip")
        sys.exit(1)

    output_file = args[0]
    project_root = args[1] if len(args) > 1 else find_project_root()
    ext = os.path.splitext(output_file)[1].lower()

    if ext == '.json':
        save_json(output_file, project_root)
    elif ext == '.txt':
        save_txt(output_file, project_root)
    elif ext == '.zip':
        save_zip(output_file, project_root)
    else:
        print(f"❌ Неподдерживаемое расширение: {ext}. Используйте .json, .txt или .zip")
        sys.exit(1)

# ----------------------------------------------------------------------
# Точка входа
# ----------------------------------------------------------------------

if __name__ == "__main__":
    # Если есть аргументы – неинтерактивный режим
    if len(sys.argv) > 1:
        non_interactive_mode()
    else:
        interactive_menu()