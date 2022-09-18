type ProjectSchema = {
    name: string,
    path: string
}

type SettingSchema = {
    pathToCybop: string;
    projects: ProjectSchema[]
}