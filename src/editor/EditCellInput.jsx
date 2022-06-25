import React, {createRef} from 'react';
import { Overlay } from 'react-overlays'
import './CellEdit.css';

class EditCellDropdown extends React.PureComponent {
    state = {
        value: this.props.cellData,
        editing: false,
    }

    target = createRef();

    handleClick = () => this.setState({ editing: true })

    handleHide = e => {
        this.setState({ editing: false })
    }

    handleChange = e => this.setState({value: e.target.value})

    render() {
        const { container, rowIndex, columnIndex } = this.props
        const { value, editing } = this.state

        return (
            <div ref={this.target} onClick={this.handleClick} className="editCell">
                {!editing && value}
                {editing && this.target && (
                    <Overlay
                        show={editing}
                        flip={true}
                        rootClose
                        container={container.tableNode}
                        target={this.target.current}
                        onHide={this.handleHide}
                    >
                        {({ props, placement }) => (
                            <div
                                {...props}
                                style={{
                                    ...props.style,
                                    width: this.target.current.offsetWidth,
                                    top:
                                        placement === 'top'
                                            ? this.target.current.offsetHeight
                                            : -this.target.current.offsetHeight,
                                }}
                            >
                                <input value={value} onChange={this.handleChange} className="editSelect" />
                            </div>
                        )}
                    </Overlay>
                )}
            </div>
        )
    }
}

export default EditCellDropdown;