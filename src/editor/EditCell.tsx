import React, { BaseSyntheticEvent } from 'react';
import { Overlay } from 'react-overlays';
import BaseTable from 'react-base-table';

type PropsType = {
    cellData: string;
    renderType: 'input' | 'select';
    selectValues?: string[];
    container: BaseTable<DataRow>;
    saveHandler: Function;
    rowData: DataRow;
    property: string;
};

type StateType = {
    value: string;
    editing: boolean;
};

class EditCellDropdown extends React.PureComponent<PropsType, StateType> {
    target = React.createRef<HTMLDivElement>();

    constructor(props: PropsType) {
        super(props);
        const { cellData } = this.props;
        this.state = {
            value: cellData,
            editing: false,
        };
    }

    controlToRender = (renderType: string, selectValues?: string[]) => {
        const { value } = this.state;
        switch (renderType) {
            case 'select':
                return (
                    selectValues && (
                        <select value={value} onChange={(e) => this.handleChange(e, true)} className="editSelect">
                            {selectValues.map((select) => (
                                <option key={select} value={select}>
                                    {select}
                                </option>
                            ))}
                        </select>
                    )
                );
            default:
                return <input value={value} onChange={(e) => this.handleChange(e, false)} className="editSelect" />;
        }
    };

    handleClick = () => {
        this.setState({ editing: true });
    };

    handleHide = () => {
        const { rowData, property, saveHandler, container } = this.props;
        const { value } = this.state;
        // @ts-ignore
        rowData[property] = value;
        saveHandler(container.getExpandedState().expandedData);
        this.setState({ editing: false });
    };

    handleChange = (e: BaseSyntheticEvent, immediateClose: boolean) => {
        this.setState({ value: e.target.value as string });
        if (immediateClose) {
            this.setState({ editing: false });
            const { rowData, property, saveHandler, container } = this.props;
            // @ts-ignore
            rowData[property] = e.target.value;
            saveHandler(container.getExpandedState().expandedData);
        }
    };

    render() {
        const { container, renderType, selectValues } = this.props;
        const { value, editing } = this.state;

        return (
            <div ref={this.target} onClick={this.handleClick} className="editCell">
                {!editing && value}
                {editing && this.target && this.target.current && (
                    <Overlay
                        show={editing}
                        flip
                        rootClose
                        container={container.getDOMNode()}
                        target={this.target.current}
                        onHide={this.handleHide}
                    >
                        {({ props, placement }) => (
                            <div
                                {...props}
                                style={{
                                    ...props.style,
                                    width: this.target.current?.offsetWidth,
                                    top:
                                        placement === 'top'
                                            ? this.target.current?.offsetHeight
                                            : -(this.target.current?.offsetHeight as number),
                                }}
                            >
                                {this.controlToRender(renderType, selectValues)}
                            </div>
                        )}
                    </Overlay>
                )}
            </div>
        );
    }
}

export default EditCellDropdown;
