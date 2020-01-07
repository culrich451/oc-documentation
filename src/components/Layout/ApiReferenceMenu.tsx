import React from 'react'
import { map as _map, findIndex as _findIndex } from 'lodash'
import {
  Collapse,
  makeStyles,
  createStyles,
  Typography,
  Theme,
} from '@material-ui/core'
import OpenApi from '../../services/openapi.service'
import { ExpandLess, ExpandMore } from '@material-ui/icons'
import {
  OrderCloudProps,
  ApiOperation,
  ApiResource,
  ApiSection,
} from '../../models/openapi.models'

interface ApiReferenceProps {
  name: string
  x_section_id: string
  x_id: string
  description: string
}

export const drawerWidthSpacingLg = 56
export const drawerWidthSpacing = drawerWidthSpacingLg - 20

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.palette.background.paper,
    },
    drawer: {
      [theme.breakpoints.up('lg')]: {
        width: theme.spacing(drawerWidthSpacingLg),
        flexShrink: 0,
      },
    },
    section: {
      cursor: 'pointer',
      display: 'flex',
      alignItems: 'center',
      margin: theme.spacing(2, 0),
    },
    resource: {
      display: 'flex',
      alignItems: 'center',
      cursor: 'pointer',
    },
    resourceActive: {
      fontWeight: 'bold',
    },
    operations: {
      listStyle: 'none',
      padding: 0,
    },
    operation: {
      ...theme.typography.body1,
      textDecoration: 'none',
    },
  })
)

interface ApiReferenceMenuProps {
  sectionChange: (sectionIndex: number) => void
  resourceChange: (resourceName: string) => void
  operationChange: (operation: ApiOperation) => void
  ocApi: OrderCloudProps
  activeIndex: number
  selectedOperation: ApiOperation
  selectedResource: ApiResource
}
export default function ApiReferenceMenu(props: ApiReferenceMenuProps) {
  const {
    ocApi,
    sectionChange,
    resourceChange,
    operationChange,
    activeIndex,
    selectedOperation,
    selectedResource,
  } = props
  return (
    <React.Fragment>
      {_map(ocApi.sections, (section, index) => {
        return (
          <Section
            key={index}
            section={section}
            ocApi={ocApi}
            sectionChange={sectionChange}
            resourceChange={resourceChange}
            operationChange={operationChange}
            activeIndex={activeIndex}
            selectedOperation={selectedOperation}
            selectedResource={selectedResource}
          />
        )
      })}
    </React.Fragment>
  )
}

interface SectionProps {
  sectionChange: (sectionIndex: number) => void
  resourceChange: (resourceName: string) => void
  operationChange: (operation: ApiOperation) => void
  section: ApiSection
  ocApi: OrderCloudProps
  activeIndex: number
  selectedOperation: ApiOperation
  selectedResource: ApiResource
}
function Section(props: SectionProps) {
  const {
    section,
    ocApi,
    sectionChange,
    activeIndex,
    resourceChange,
    operationChange,
    selectedOperation,
    selectedResource,
  } = props

  const classes = useStyles(props)
  const sectionIndex = _findIndex(
    ocApi.sections,
    sect => sect['x-id'] === section['x-id']
  )
  const isActive = sectionIndex === activeIndex
  const [open, setOpen] = React.useState(isActive)

  const resources = ocApi.resources.filter(
    r => r['x-section-id'] == section['x-id']
  )

  function handleClick() {
    setOpen(!open)
    sectionChange(sectionIndex)
  }

  return (
    <React.Fragment>
      <Typography
        variant="h4"
        display="block"
        className={classes.section}
        onClick={handleClick}
      >
        {section.name}
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Collapse in={isActive} timeout="auto" unmountOnExit>
        {resources.map((resource, index) => (
          <Resource
            key={index}
            resource={resource}
            operationChange={operationChange}
            resourceChange={resourceChange}
            isActive={
              resource.name ===
              (selectedResource
                ? selectedResource.name
                : selectedOperation
                ? selectedOperation.resource.name
                : false)
            }
            selectedOperation={selectedOperation}
          />
        ))}
      </Collapse>
    </React.Fragment>
  )
}

interface ResourceProps {
  resource: ApiResource
  resourceChange: (resourceName: string) => void
  operationChange: (operation: ApiOperation) => void
  selectedOperation: ApiOperation
  isActive: boolean
}
function Resource(props: ResourceProps) {
  const { resource, operationChange, resourceChange, isActive } = props

  const classes = useStyles(props)

  const [open, setOpen] = React.useState(isActive)

  const operations = OpenApi.operationsByResource
    ? OpenApi.operationsByResource[resource.name]
    : null

  function handleClick() {
    setOpen(!open)
    resourceChange(resource.name)
  }

  return (
    <React.Fragment>
      <Typography
        variant="button"
        display="block"
        className={`${classes.resource} ${
          isActive ? classes.resourceActive : ''
        }`}
        onClick={handleClick}
      >
        {resource.name}
        {open ? <ExpandLess /> : <ExpandMore />}
      </Typography>
      <Collapse in={isActive} timeout="auto" unmountOnExit>
        <ul className={classes.operations}>
          {operations && operations.length
            ? operations.map((o, index) => {
                return (
                  <li key={index} onClick={() => operationChange(o)}>
                    <a className={classes.operation} href={`#${o.operationId}`}>
                      {o.summary.replace(/\./g, ' ')}
                    </a>
                  </li>
                )
              })
            : null}
        </ul>
      </Collapse>
    </React.Fragment>
  )
}
