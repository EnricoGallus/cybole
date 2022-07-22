import React, { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, ButtonGroup, Grid, Page } from '@geist-ui/core';
import { Settings, List } from '@geist-ui/icons';

type PropsType = {
    children: ReactNode;
};

const ProjectSelector = (props: PropsType) => {
    const navigation = useNavigate();
    const { children } = props;
    const handleMenu = (route: string) => {
        navigation(route);
    };

    return (
        <Page>
            <Page.Header>
                <h2>Projects</h2>
            </Page.Header>
            <Page.Content>
                <Grid.Container>
                    <Grid xs={6} px="2">
                        <ButtonGroup vertical width="100%">
                            <Button icon={<List />} type="secondary" ghost onClick={() => handleMenu('/')}>
                                Projects
                            </Button>
                            <Button icon={<Settings />} type="secondary" ghost onClick={() => handleMenu('/settings')}>
                                Settings
                            </Button>
                        </ButtonGroup>
                    </Grid>
                    <Grid xs={18}>
                        <Grid.Container>
                            <Grid xs={24} md={18}>
                                {children}
                            </Grid>
                            {/* <Grid xs={24}>
                            <ProjectList/>
                        </Grid> */}
                        </Grid.Container>
                    </Grid>
                </Grid.Container>
            </Page.Content>
        </Page>
    );
};

export default ProjectSelector;
