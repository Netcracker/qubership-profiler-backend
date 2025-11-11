#!/usr/bin/env python3
"""
Migration script to replace forked Ant Design imports with open-source equivalents
"""
import os
import re
from pathlib import Path

# Component mappings
COMPONENT_MAPPINGS = {
    'UxButton': 'Button',
    'UxInput': 'Input',
    'UxSelect': 'Select',
    'UxRadio': 'Radio',
    'UxTabs': 'Tabs',
    'UxTable': 'Table',
    'UxTableNew': 'Table',
    'UxTooltip': 'Tooltip',
    'UxProgress': 'Progress',
    'UxDropdown': 'Dropdown',
    'UxDropdownNew': 'Dropdown',
    'UxMenu': 'Menu',
    'UxPopover': 'Popover',
    'UxPopoverNew': 'Popover',
    'UxPopupNew': 'Modal',
    'UxTree': 'Tree',
    'UxLoader': 'Spin',
    'UxChip': 'Tag',
    'UxLayout': 'Layout',
    'UxLink': 'Typography.Link',
    'UxTextArea': 'Input.TextArea',
    'UxSearch': 'Input.Search',
    'UxIcon': '',  # Will be removed, icons used directly
}

def migrate_file(file_path):
    """Migrate a single TypeScript/TSX file"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Track what needs to be imported from antd
    antd_imports = set()

    # Remove imports from forked packages
    # Match multi-line imports
    content = re.sub(
        r"import\s+{[^}]*}\s+from\s+['\"]@netcracker/ux-react[^'\"]*['\"];?\s*\n",
        '',
        content
    )
    content = re.sub(
        r"import\s+{[^}]*}\s+from\s+['\"]@netcracker/cse-ui-components[^'\"]*['\"];?\s*\n",
        '',
        content
    )
    content = re.sub(
        r"import\s+.*from\s+['\"]@netcracker/ux-react[^'\"]*['\"];?\s*\n",
        '',
        content
    )
    content = re.sub(
        r"import\s+.*from\s+['\"]@netcracker/cse-ui-components[^'\"]*['\"];?\s*\n",
        '',
        content
    )

    # Remove icon imports from @netcracker/ux-assets
    content = re.sub(
        r"import\s+{[^}]*}\s+from\s+['\"]@netcracker/ux-assets[^'\"]*['\"];?\s*\n",
        '',
        content
    )

    # Replace component usage
    for ux_comp, antd_comp in COMPONENT_MAPPINGS.items():
        if ux_comp in content:
            if antd_comp and '.' not in antd_comp:
                antd_imports.add(antd_comp)
            elif antd_comp == 'Typography.Link':
                antd_imports.add('Typography')
            elif antd_comp == 'Input.TextArea' or antd_comp == 'Input.Search':
                antd_imports.add('Input')

    # Replace specific imports with local utilities
    if 'uxNotificationHelper' in content:
        content = re.sub(
            r"from\s+['\"]@netcracker/ux-react['\"]",
            "from '@app/utils/notification'",
            content
        )

    if 'downloadFile' in content and '@netcracker/ux-react' in content:
        # Add import for downloadFile from utils
        if "import" in content:
            first_import_match = re.search(r'^import', content, re.MULTILINE)
            if first_import_match:
                insert_pos = first_import_match.start()
                content = content[:insert_pos] + "import { downloadFile } from '@app/utils/download-file';\n" + content[insert_pos:]

    # Replace custom components with local versions
    replacements = {
        'ContentCard': '@app/components/content-card/content-card',
        'SummaryCard': '@app/components/summary-card/summary-card',
        'IsoDatePicker': '@app/components/iso-date-picker/iso-date-picker',
        'InfoPage': '@app/components/info-page/info-page',
        'ContextBar': '@app/components/context-bar/context-bar',
        'PropertiesList': '@app/components/properties-list/properties-list',
        'UxHeader': '@app/components/app-header-layout/app-header-layout',
    }

    for comp, path in replacements.items():
        if comp in content:
            # Check if component is used
            if re.search(rf'\b{comp}\b', content):
                # Add import if not already there
                import_line = f"import {{ {comp if comp != 'UxHeader' else 'AppHeaderLayout as UxHeader'} }} from '{path}';\n"
                if import_line not in content and "import" in content:
                    first_import_match = re.search(r'^import', content, re.MULTILINE)
                    if first_import_match:
                        insert_pos = first_import_match.start()
                        content = content[:insert_pos] + import_line + content[insert_pos:]

    # Add antd imports if needed
    if antd_imports:
        import_line = f"import {{ {', '.join(sorted(antd_imports))} }} from 'antd';\n"
        if "import" in content:
            first_import_match = re.search(r'^import', content, re.MULTILINE)
            if first_import_match:
                insert_pos = first_import_match.start()
                content = content[:insert_pos] + import_line + content[insert_pos:]

    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def migrate_scss_file(file_path):
    """Migrate SCSS files to remove forked package imports"""
    with open(file_path, 'r', encoding='utf-8') as f:
        content = f.read()

    original_content = content

    # Remove imports from forked packages
    content = re.sub(
        r"@import\s+['\"]@netcracker/ux-react[^'\"]*['\"];?\s*\n",
        '',
        content
    )
    content = re.sub(
        r"@use\s+['\"]@netcracker/ux-react[^'\"]*['\"];?\s*\n",
        '',
        content
    )

    # Only write if content changed
    if content != original_content:
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        return True
    return False

def main():
    """Main migration function"""
    src_dir = Path('/home/user/qubership-profiler-backend/apps/query/src')

    migrated_files = []

    # Migrate TypeScript files
    for ext in ['*.ts', '*.tsx']:
        for file_path in src_dir.rglob(ext):
            if migrate_file(file_path):
                migrated_files.append(str(file_path))
                print(f"Migrated: {file_path}")

    # Migrate SCSS files
    for file_path in src_dir.rglob('*.scss'):
        if migrate_scss_file(file_path):
            migrated_files.append(str(file_path))
            print(f"Migrated SCSS: {file_path}")

    print(f"\nTotal files migrated: {len(migrated_files)}")

if __name__ == '__main__':
    main()
