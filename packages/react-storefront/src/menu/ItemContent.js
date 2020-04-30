/**
 * @license
 * Copyright © 2017-2019 Moov Corporation.  All rights reserved.
 */
import React, { Component, Fragment } from 'react'
import { observer, inject } from 'mobx-react'
import ListItemText from '@material-ui/core/ListItemText'
import ListItemIcon from '@material-ui/core/ListItemIcon'
import MenuContext from './MenuContext'
import ExpanderIcon from './ExpanderIcon'
import CircularProgress from '@material-ui/core/CircularProgress'

@inject('app')
@observer
export default class ItemContent extends Component {
  static contextType = MenuContext

  render() {
    let { itemContentRenderer, item, leaf } = this.props

    const { classes } = this.context

    let contents

    if (itemContentRenderer) {
      contents = itemContentRenderer(item, leaf)
    }

    if (contents || contents === null) {
      return contents
    } else if (leaf) {
      return (
        <Fragment>
          {item.image && (
            <ListItemIcon>
              <img className={classes.listItemImage} alt={item.text} src={item.image} />
            </ListItemIcon>
          )}
          <ListItemText primary={item.text} disableTypography />
        </Fragment>
      )
    } else {
      return (
        <Fragment>
          {item.image && (
            <ListItemIcon>
              <img className={classes.listItemImage} alt={item.text} src={item.image} />
            </ListItemIcon>
          )}
          <ListItemText className={classes.listItem} primary={item.text} disableTypography />
          <ListItemIcon className={classes.listItemIcon}>
            {item.loading ? (
              <CircularProgress
                style={{ height: 24, width: 24, padding: 4 }}
                color="secondary"
                className={classes.loadingIcon}
              />
            ) : (
              <ExpanderIcon {...this.props} />
            )}
          </ListItemIcon>
        </Fragment>
      )
    }
  }
}
