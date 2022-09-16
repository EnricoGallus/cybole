import React from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import EditInXmlFormat from '../src/editor/EditInXmlFormat';

describe('EditInXmlFormat', () => {
    test('renders component', () => {
        const { container } = render(
            <EditInXmlFormat
                fileKey="test.xml"
                content='<node><node name="test" format="" /><node name="test2" /></node>'
            />,
            { wrapper: MemoryRouter }
        );

        expect(container).toMatchSnapshot();
    });
});
