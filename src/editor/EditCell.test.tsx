import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditCell from './EditCell';

describe('EditCell', () => {
    test('renders component', () => {
        const rowData = { id: '1', parentId: null, name: '', format: '', channel: '', model: '', children: [] };

        // @ts-ignore
        const { container } = render(
            <EditCell cellData="test" renderType="input" property="format" rowData={rowData} saveHandler={() => {}} />,
            { wrapper: MemoryRouter }
        );

        expect(container).toMatchSnapshot();
    });
});
