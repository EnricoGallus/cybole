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

    handleHide = () => this.setState({ editing: false })

    handleChange = e =>
        this.setState({
            value: e.target.value,
            editing: false,
        })

    render() {
        const { container, rowIndex, columnIndex } = this.props
        const { value, editing } = this.state

        return (
            <div ref={this.target} onClick={this.handleClick} className="editCell">
                {!editing && value}
                {editing && this.target && (
                    <Overlay
                        show={editing}
                        flip
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
                                <select value={value} onChange={this.handleChange} className="editSelect">
                                    <option value="grapefruit">Grapefruit</option>
                                    <option value="lime">Lime</option>
                                    <option value="coconut">Coconut</option>
                                    <option value="mango">Mango</option>
                                </select>
                            </div>
                        )}
                    </Overlay>
                )}
            </div>
        )
    }
}

export default EditCellDropdown;