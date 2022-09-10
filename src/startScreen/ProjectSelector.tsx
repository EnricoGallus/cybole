import React, {ReactNode} from 'react';
import {useNavigate} from 'react-router-dom';
import {Menu} from "primereact/menu";

type PropsType = {
    children: ReactNode;
};

const ProjectSelector = (props: PropsType) => {
    const navigation = useNavigate();
    const {children} = props;
    const handleMenu = (route: string) => {
        navigation(route);
    };

    const menuItems = [
        {
            label: 'Menu',
            items: [
                {
                    label: 'Projects',
                    icon: 'pi pi-align-justify',
                    command: (e) => {
                        handleMenu('/')
                    }
                },
                {
                    label: 'Settings',
                    icon: 'pi pi-cog',
                    command: (e) => {
                        handleMenu('/settings')
                    }
                }
            ]
        }
    ];

    return (
        <div className="grid">
            <div className="card col-12">
                <h5>Projects</h5>
            </div>
            <div className="col-3 pl-5">
                <Menu model={menuItems}/>
            </div>
            <div className="col-9">
                {children}
            </div>
        </div>
    );
};

export default ProjectSelector;
