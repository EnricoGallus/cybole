import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditInXmlFormat from '../src/editor/EditInXmlFormat';

describe('EditInXmlFormat', () => {
    test('renders the loaded XML document', async () => {
        const stateChanger = jest.fn();
        render(
            <EditInXmlFormat
                fileKey="test.xml"
                stateChanger={stateChanger}
                content='<node><node name="test" format="" /><node name="test2" /></node>'
            />,
            { wrapper: MemoryRouter }
        );

        expect(await screen.findByText('test')).toBeInTheDocument();
        expect(screen.getByText('test2')).toBeInTheDocument();
    });
});
