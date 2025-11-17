#!/bin/bash

# Script to migrate imports from @netcracker packages to antd and compat components

cd /home/user/qubership-profiler-backend/apps/query

# Find all TypeScript/TSX files
FILES=$(find src -type f \( -name "*.ts" -o -name "*.tsx" \) ! -path "*/compat/*")

for file in $FILES; do
    # Replace @netcracker/cse-ui-components imports
    sed -i "s|from '@netcracker/cse-ui-components'|from '@app/components/compat'|g" "$file"
    sed -i "s|from '@netcracker/cse-ui-components/components/summary-card/summary-card'|from '@app/components/compat'|g" "$file"
    sed -i "s|from '@netcracker/cse-ui-components/components/properties-list/properties-list'|from '@app/components/compat'|g" "$file"
    sed -i "s|from '@netcracker/cse-ui-components/utils/confirm'|from '@app/components/compat'|g" "$file"
    sed -i "s|from '@netcracker/cse-ui-components/utils/highlight'|from '@app/components/compat'|g" "$file"
    sed -i "s|from '@netcracker/cse-ui-components/utils/ux-input-wrapper'|from 'antd'|g" "$file"

    # Replace UxInputWrapper type
    sed -i "s|UxInputWrapper|any|g" "$file"

    # Replace @netcracker/ux-react basic imports with antd
    sed -i "s|from '@netcracker/ux-react/loader/loader.component'|from 'antd'|g" "$file"
    sed -i "s|UxLoader|Spin|g" "$file"

    sed -i "s|from '@netcracker/ux-react/header'|from 'antd'|g" "$file"
    sed -i "s|UxHeader|Layout.Header|g" "$file"

    sed -i "s|from '@netcracker/ux-react/inputs/select'|from 'antd'|g" "$file"
    sed -i "s|from '@netcracker/ux-react/inputs/select/select.model'|from 'antd'|g" "$file"
    sed -i "s|UxSelect|Select|g" "$file"
    sed -i "s|UxSelectProps|any|g" "$file"
    sed -i "s|UxSelectValue|any|g" "$file"

    sed -i "s|from '@netcracker/ux-react/inputs/input/search/search.component'|from 'antd'|g" "$file"
    sed -i "s|UxSearch|Input.Search|g" "$file"

    sed -i "s|from '@netcracker/ux-react/inputs/input/textarea/textarea.component'|from 'antd'|g" "$file"
    sed -i "s|UxTextArea|Input.TextArea|g" "$file"

    sed -i "s|from '@netcracker/ux-react/typography/link/link.component'|from 'antd'|g" "$file"
    sed -i "s|UxLink|Typography.Link|g" "$file"

    # Replace downloadFile import
    sed -i "s|from '@netcracker/ux-react'|from 'antd'|g" "$file"

    # Replace uxNotificationHelper import
    sed -i "s|uxNotificationHelper|notification|g" "$file"
done

echo "Import migration complete!"
