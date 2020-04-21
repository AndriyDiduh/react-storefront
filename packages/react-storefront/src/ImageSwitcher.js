/**
 * @license
 * Copyright © 2017-2018 Moov Corporation.  All rights reserved.
 */
import React, { Fragment, Component, createRef } from 'react'
import PropTypes from 'prop-types'
import SwipeableViews from 'react-swipeable-views'
import { autoPlay, virtualize } from 'react-swipeable-views-utils'
import { mod } from 'react-swipeable-views-core'
import withStyles from '@material-ui/core/styles/withStyles'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import IconButton from '@material-ui/core/IconButton'
import Portal from '@material-ui/core/Portal'
import { fade } from '@material-ui/core/styles/colorManipulator'
import classnames from 'classnames'
import ReactImageMagnify from 'react-image-magnify'
import { ReactPinchZoomPan } from 'react-pinch-zoom-pan'
import TabsRow from './TabsRow'
import analytics from './analytics'
import { inject, observer } from 'mobx-react'
import AmpImageSwitcher from './amp/AmpImageSwitcher'
import LoadMask from './LoadMask'
import Image from './Image'
import Video from './Video'
import isEqual from 'lodash/isEqual'
import get from 'lodash/get'
import set from 'lodash/set'

const AutoPlaySwipeableViews = autoPlay(SwipeableViews)
const VirtualizeSwipeableViews = virtualize(SwipeableViews)
const AutoPlayVirtualizeSwipeableViews = autoPlay(VirtualizeSwipeableViews)

const paletteIconTextColor = '#77726D'

const mediaPropType = PropTypes.shape({
  src: PropTypes.string.isRequired,
  alt: PropTypes.string,
  video: PropTypes.bool
})

export const styles = theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    position: 'relative',

    '& img.rsf-imageSwitcherImage': {
      display: 'block'
    }
  },

  swipeWrap: {
    position: 'relative',
    overflow: 'hidden',
    flex: 1,
    '& .react-swipeable-view-container, & > div:first-child': {
      height: '100%'
    }
  },

  imageWrap: {
    height: '100%',
    width: '100%',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    '& img.rsf-imageSwitcherImage': {
      maxHeight: '100%',
      maxWidth: '100%',
      objectFit: 'contain'
    }
  },

  thumbsTitle: {
    textTransform: 'uppercase'
  },

  productThumb: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0
  },

  bottomThumbs: {
    marginTop: `${theme.margins.container}px`
  },

  topThumbs: {
    marginBottom: `${theme.margins.container}px`,
    order: -1
  },

  leftThumbs: {
    [theme.breakpoints.down('xs')]: {
      marginTop: `${theme.margins.container}px`
    },
    [theme.breakpoints.up('sm')]: {
      marginRight: `${theme.margins.container}px`,
      order: -1
    }
  },

  rightThumbs: {
    [theme.breakpoints.down('xs')]: {
      marginTop: `${theme.margins.container}px`
    },
    [theme.breakpoints.up('sm')]: {
      marginLeft: `${theme.margins.container}px`
    }
  },

  sideThumbs: {
    [theme.breakpoints.up('sm')]: {
      flexDirection: 'row'
    }
  },

  sideThumbTabs: {
    flexDirection: 'column'
  },

  sideThumbTab: {
    border: '2px solid transparent'
  },
  selectedSideThumbTab: {
    [theme.breakpoints.up('sm')]: {
      border: `2px solid ${theme.palette.grey[400]}`
    }
  },

  thumbnail: {
    paddingBottom: '8px',
    margin: '0 2px',
    boxSizing: 'content-box',
    height: '50px',
    width: '50px'
  },

  sideThumbnail: {
    padding: 3
  },

  activeThumbs: {
    position: 'absolute',
    width: '100%',
    bottom: '20px'
  },

  selected: {
    borderColor: '#D0D0D0'
  },

  arrows: {
    [theme.breakpoints.down('xs')]: {
      display: 'none'
    }
  },

  arrow: {
    position: 'absolute',
    top: '50%',
    marginTop: '-24px'
  },

  leftArrow: {
    left: 0
  },

  rightArrow: {
    right: 0
  },

  icon: {
    height: '30px',
    width: '30px'
  },

  dot: {
    backgroundColor: fade(theme.palette.text.primary, 0.25),
    width: 8,
    height: 8,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: theme.palette.background.paper,
    borderRadius: '50%',
    display: 'inline-block',
    margin: '0 2px',
    // Same duration as SwipeableViews animation
    transitionDuration: '0.35s'
  },

  dotSelected: {
    backgroundColor: theme.palette.text.primary
  },

  dots: {
    position: 'absolute',
    bottom: '5px',
    textAlign: 'center',
    width: '100%'
  },

  viewerToggle: {
    transform: 'scale(0.4)',
    position: 'absolute',
    top: 0,
    right: 0,
    background: fade(theme.palette.text.icon || paletteIconTextColor, 0.4),
    borderRadius: '50%',
    width: '100px',
    height: '100px',
    transitionDuration: '0.5s',
    '-webkit-tap-highlight-color': 'rgba(0, 0, 0, 0)'
  },

  viewerActive: {
    transform: 'scale(0.4) rotateZ(45deg)'
  },

  viewerOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: theme.palette.background.paper,
    zIndex: 9999,
    transitionDuration: '0.5s',
    transform: 'translateY(100%)',
    visibility: 'hidden', // prevents lightbox from showing near the bottom of screen when browser controls hide on ios
    '& img': {
      margin: 'auto',
      maxHeight: '100%',
      maxWidth: '100%'
    },
    // Hack to fix root div height of pan/zoom/pinch container
    '& > div:first-child': {
      height: '100%'
    }
  },

  viewerOverlayActive: {
    transform: 'translateY(0%)',
    visibility: 'visible'
  },

  tabsRowRoot: {
    boxShadow: 'none'
  },

  tabScroller: {
    [theme.breakpoints.down('xs')]: {
      padding: `0 ${theme.margins.container}px`
    }
  },

  indicator: {
    display: 'none'
  },

  mask: {
    opacity: '0.8'
  },

  playButton: {
    '&:after': {
      color: 'white',
      content: '"►"',
      position: 'absolute',
      left: 'calc(50% - 24px)',
      top: 'calc(50% - 24px)',
      fontSize: '48px'
    }
  },

  playing: {
    '&:after': {
      display: 'none'
    }
  }
})

/**
 * A swipeable image selector suitable for PDPs
 */
@withStyles(styles, { name: 'RSFImageSwitcher' })
@inject('app')
@observer
export default class ImageSwitcher extends Component {
  static propTypes = {
    /**
     * If specified, then the image_switched analytics event will be
     * fired when an image is selected and the product's images and thumbnails will
     * automatically be displayed.
     */
    product: PropTypes.object,

    /**
     * An array of (URL or image object) for the full size images
     */
    images: PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, mediaPropType])).isRequired,

    /**
     * An array of thumbnails to display below the main image.  You can also
     * specify `false` to hide the thumbnails entirely.
     */
    thumbnails: PropTypes.oneOfType([
      PropTypes.bool,
      PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.string, mediaPropType]))
    ]),

    /**
     * Display left/right arrows for navigating through images
     */
    arrows: PropTypes.bool,

    /**
     * Display indicator dots at the bottom of the component
     */
    indicators: PropTypes.bool,

    /**
     * Optional title for thumbnails block
     */
    thumbnailsTitle: PropTypes.string,

    /*
     * Option to show thumbnails only when zoomed view is active
     */
    viewerThumbnailsOnly: PropTypes.bool,

    /**
     * Props to apply to the Image component used to display the product thumbnail while
     * the product data is loading
     */
    loadingThumbnailProps: PropTypes.object,

    /**
     * Props to apply to the thumbnail images
     */
    thumbnailImageProps: PropTypes.object,

    /**
     * Position of thumbnails, relative to the image viewer
     */
    thumbnailPosition: PropTypes.oneOf(['bottom', 'top', 'left', 'right']),

    /**
     * Props to be added to the Image child components.
     */
    imageProps: PropTypes.object,

    /**
     * Props passed to the [`ReactImageMagnify`](https://github.com/ethanselzer/react-image-magnify#usage)
     * element for an image when pan-to-zoom is enabled (via image `zoomWidth` + `zoomHeight` + `zoomSrc`).
     */
    magnifyProps: PropTypes.object,

    /*
     * Option to manually set the selected index
     */
    selectedIndex: PropTypes.number,

    /**
     * The URL of image to load if an image fails to load
     */
    notFoundSrc: PropTypes.string,

    /**
     * Config options for the image viewer
     */
    reactPinchZoomPanOptions: PropTypes.shape({
      onPinchStart: PropTypes.func,
      onPinchStop: PropTypes.func,
      initialScale: PropTypes.number,
      maxScale: PropTypes.number
    }),

    /**
     * Set to true to always revert back to the first image when image URLs
     * are changed.  This behavior is automatically adopted when the `product`
     * prop is specified.
     */
    resetSelectionWhenImagesChange: PropTypes.bool,

    /**
     * If false, the auto play behavior is disabled
     */
    autoplay: PropTypes.bool,

    /**
     * This is the auto play direction
     */
    direction: PropTypes.string,

    /**
     * Delay between auto play transitions (in ms)
     */
    interval: PropTypes.number,

    /**
     * If true, scrolling past the last slide will cycle back to the first
     */
    infinite: PropTypes.bool,

    /**
     * Amount of pixels to pad the slide container
     */
    inset: PropTypes.number,

    /**
     * If infinite is enabled, the number of slides to show for each index
     */
    slidesToShow: PropTypes.number,

    /**
     * Amount of pixels of spacing between each slide
     */
    slideSpacing: PropTypes.number,

    /**
     * Additional props to be passed on to the react-swipeable-views component
     */
    swipeableViewsProps: PropTypes.object,

    /**
     * Additional props to be passed on to "previous" IconButton
     */
    prevButtonProps: PropTypes.object,

    /**
     * Additional props to be passed on to "next" IconButton
     */
    nextButtonProps: PropTypes.object,
  }

  static defaultProps = {
    images: [],
    thumbnails: [],
    viewerThumbnailsOnly: false,
    arrows: true,
    indicators: false,
    loadingThumbnailProps: {},
    thumbnailPosition: 'bottom',
    imageProps: {},
    reactPinchZoomPanOptions: {
      maxScale: 3
    },
    autoplay: false,
    direction: 'incremental',
    interval: 3000,
    infinite: false,
    slidesToShow: 1,
    inset: 0,
    slideSpacing: 0,
    swipeabeViewsProps: {},
    prevButtonProps: {
      'aria-label': 'previous'
    },
    nextButtonProps: {
      'aria-label': 'next'
    }
  }

  state = {
    fullSizeImagesLoaded: true,
    viewerActive: false,
    playingVideo: false
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const images = normalizeImages(nextProps, 'images')
    const nextState = {
      images,
      thumbnails: normalizeImages(nextProps, 'thumbnails'),
      selectedIndex:
        nextProps.selectedIndex != null ? nextProps.selectedIndex : prevState.selectedIndex || 0,
      maxIndex: Math.ceil(images.length / nextProps.slidesToShow)
    }

    if (!prevState.images || !isEqual(nextState.images, prevState.images)) {
      // new images are loading in, show the loadingProduct.thumbnail
      nextState.fullSizeImagesLoaded = false

      // reset the selected index to the first image
      if (!nextProps.selectedIndex) {
        nextState.selectedIndex = 0
      }

      return nextState
    } else if (prevState.selectedIndex == null) {
      return nextState
    } else {
      return null
    }
  }

  componentWillUnmount() {
    if (this.disposeReaction) {
      this.disposeReaction()
    }
  }

  renderViewerToggle() {
    return (
      <div
        onClick={() => this.toggleViewer()}
        className={classnames(this.props.classes.viewerToggle, {
          [this.props.classes.viewerActive]: this.state.viewerActive
        })}
      >
        <svg width="100" height="100" viewBox="0 0 100 100">
          <line x1="50" y1="25" x2="50" y2="75" strokeWidth="4" stroke="white" />
          <line x1="25" y1="50" x2="75" y2="50" strokeWidth="4" stroke="white" />
        </svg>
      </div>
    )
  }

  toggleViewer() {
    if (this.state.viewerActive) {
      document.body.classList.remove('moov-modal')
    } else {
      document.body.classList.add('moov-modal')
    }

    this.setState({ viewerActive: !this.state.viewerActive })
  }

  getSelectedIndex = () => {
    const { selectedIndex, maxIndex } = this.state
    return mod(selectedIndex, maxIndex)
  }

  renderDot(index) {
    const classes = classnames(this.props.classes.dot, {
      [this.props.classes.dotSelected]: index === this.getSelectedIndex()
    })
    return <div key={index} className={classes} />
  }

  renderThumbnails() {
    const {
      classes,
      thumbnailsTitle,
      notFoundSrc,
      thumbnailImageProps,
      thumbnailPosition
    } = this.props
    const { thumbnails } = this.state
    const modifiedThumbs = thumbnails && thumbnails.map(({ src, alt }) => ({ imageUrl: src, alt }))
    const { viewerActive } = this.state
    const isVertical = ['left', 'right'].includes(thumbnailPosition)

    return (
      thumbnails &&
      thumbnails.length > 0 && (
        <div
          className={classnames(classes.thumbs, {
            [classes.activeThumbs]: viewerActive,
            [classes.leftThumbs]: !viewerActive && thumbnailPosition === 'left',
            [classes.rightThumbs]: !viewerActive && thumbnailPosition === 'right',
            [classes.topThumbs]: !viewerActive && thumbnailPosition === 'top',
            [classes.bottomThumbs]: !viewerActive && thumbnailPosition === 'bottom'
          })}
        >
          <div className="field">
            <label className={classes.thumbsTitle}>{thumbnailsTitle}</label>
          </div>
          <TabsRow
            classes={{
              scroller: classes.tabScroller,
              root: classnames(classes.tabsRowRoot, {
                [classes.sideThumbTabs]: !viewerActive && isVertical
              }),
              tab: classnames({
                [classes.sideThumbTab]: !viewerActive && isVertical
              }),
              selectedTab: classnames({
                [classes.selectedSideThumbTab]: !viewerActive && isVertical
              })
            }}
            imageProps={{
              className: classnames(classes.thumbnail, {
                [classes.sideThumbnail]: !viewerActive && isVertical
              }),
              notFoundSrc,
              fill: true,
              ...thumbnailImageProps
            }}
            centered
            initialSelectedIdx={this.getSelectedIndex()}
            orientation={!viewerActive && isVertical ? 'vertical' : 'horizontal'}
            onTabChange={(e, selectedIndex) =>
              this.setState({ selectedIndex, playingVideo: false })
            }
            items={modifiedThumbs}
          />
        </div>
      )
    )
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState &&
      prevState.selectedIndex &&
      prevState.selectedIndex !== this.state.selectedIndex &&
      this.props.product
    ) {
      analytics.fire('imageSwitched', {
        product: this.props.product,
        imageUrl: this.props.images[this.state.selectedIndex]
      })
    }
  }

  renderSlide = ({
    key,
    style,
    index,
    src,
    alt,
    video,
    poster,
    zoomSrc,
    zoomWidth,
    zoomHeight
  }) => {
    const { notFoundSrc, imageProps, classes, magnifyProps } = this.props
    const imageOnLoad = idx => (idx === 0 ? this.onFullSizeImagesLoaded : () => {})
    return (
      <div key={key} style={style} className={classes.imageWrap}>
        {video ? (
          <Video src={src} alt={alt} poster={poster} />
        ) : zoomSrc && zoomWidth && zoomHeight ? (
          <ImageMagnify
            magnifyProps={magnifyProps}
            imageProps={imageProps}
            src={src}
            alt={alt}
            notFoundSrc={notFoundSrc}
            zoomSrc={zoomSrc}
            zoomWidth={zoomWidth}
            zoomHeight={zoomHeight}
            onLoad={imageOnLoad(index)}
          />
        ) : (
          <Image
            notFoundSrc={notFoundSrc}
            src={src}
            alt={alt}
            onLoad={imageOnLoad(index)}
            contain
            {...imageProps}
          />
        )}
      </div>
    )
  }

  slideRenderer = ({ key, index }) => {
    const { slidesToShow } = this.props
    const { images, maxIndex } = this.state
    const slideCount = images.length

    let baseindex = mod(index, maxIndex) * slidesToShow
    baseindex = baseindex + slidesToShow >= slideCount ? slideCount - slidesToShow : baseindex
    let slide = []
    for (let i = 0; i < slidesToShow; i++) {
      slide.push(
        this.renderSlide({
          key,
          index: i,
          ...images[baseindex + i]
        })
      )
    }

    return <Fragment key={key}>{slide}</Fragment>
  }

  render() {
    let {
      app,
      product,
      classes,
      className,
      arrows,
      indicators,
      style,
      reactPinchZoomPanOptions,
      loadingThumbnailProps,
      viewerThumbnailsOnly,
      inset,
      autoplay,
      interval,
      direction,
      infinite,
      slidesToShow,
      slideSpacing,
      swipeableViewsProps,
      magnifyProps,
      prevButtonProps,
      nextButtonProps,
      thumbnailPosition
    } = this.props

    const { fullSizeImagesLoaded, images, thumbnails } = this.state

    if (app.amp) {
      return (
        <AmpImageSwitcher
          product={product}
          images={images}
          className={className}
          classes={{
            root: classes.root,
            dot: classes.dot,
            dots: classes.dots,
            dotSelected: classes.dotSelected,
            thumbnails: classes.thumbs
          }}
          arrows={arrows}
          indicators={indicators}
          thumbnails={viewerThumbnailsOnly ? null : thumbnails}
          thumbnailPosition={thumbnailPosition}
        />
      )
    }

    const { viewerActive } = this.state
    const selectedImage = images[this.getSelectedIndex()]
    const SelectedImageTag = selectedImage.video ? 'video' : 'img'
    magnifyProps = magnifyProps || {}
    set(
      magnifyProps,
      'imageClassName',
      classnames(get(magnifyProps, 'imageClassName'), 'rsf-imageSwitcherImage')
    )
    set(magnifyProps, 'style', { ...get(magnifyProps, 'style', {}), display: 'flex' })
    set(magnifyProps, 'enlargedImageStyle', {
      ...get(magnifyProps, 'enlargedImageStyle', {}),
      height: '100%'
    })

    let Tag = infinite ? VirtualizeSwipeableViews : SwipeableViews
    Tag = autoplay ? AutoPlaySwipeableViews : Tag
    Tag = infinite && autoplay ? AutoPlayVirtualizeSwipeableViews : Tag

    const tagProps = {
      index: this.state.selectedIndex,
      direction,
      interval,
      onChangeIndex: i => {
        // Limit to single index change
        const delta = Math.sign(i - this.state.selectedIndex)
        this.setState({ selectedIndex: this.state.selectedIndex + delta })
      },
      slideStyle: {
        padding: `0 ${slideSpacing}px`,
        overflow: 'hidden'
      },
      style: {
        padding: `0 ${inset}px`
      },
      ...swipeableViewsProps
    }

    if (infinite) {
      tagProps.slideRenderer = this.slideRenderer
    } else {
      tagProps.children = images.map((image, i) => this.renderSlide({ ...image, key: i, index: i }))
    }

    const slideCount = images.length

    return (
      <div
        className={classnames(className, classes.root, {
          [classes.sideThumbs]: ['left', 'right'].includes(thumbnailPosition)
        })}
        style={style}
      >
        {/* Full Size Images */}
        <div className={classes.swipeWrap}>
          <Tag {...tagProps} />
          {arrows && slideCount > slidesToShow && (
            <div className={classes.arrows}>
              {(this.state.selectedIndex !== 0 || infinite) && (
                <IconButton
                  className={classnames(classes.arrow, classes.leftArrow)}
                  onClick={() => this.setState({ selectedIndex: this.state.selectedIndex - 1 })}
                  {...prevButtonProps}
                >
                  <ChevronLeft classes={{ root: classes.icon }} />
                </IconButton>
              )}
              {(this.state.selectedIndex !== slideCount - 1 || infinite) && (
                <IconButton
                  className={classnames(classes.arrow, classes.rightArrow)}
                  onClick={() => this.setState({ selectedIndex: this.state.selectedIndex + 1 })}
                  {...nextButtonProps}
                >
                  <ChevronRight classes={{ root: classes.icon }} />
                </IconButton>
              )}
            </div>
          )}

          {indicators && slideCount > slidesToShow && (
            <div className={classes.dots}>
              {Array(Math.ceil(slideCount / slidesToShow))
                .fill(0)
                .map((_, index) => this.renderDot(index))}
            </div>
          )}

          {product && <LoadMask show={product.loadingImages} className={classes.mask} />}

          {product &&
            app.loadingProduct &&
            app.loadingProduct.thumbnail &&
            !fullSizeImagesLoaded && (
              <Image
                src={app.loadingProduct.thumbnail}
                className={classes.productThumb}
                {...loadingThumbnailProps}
                fill
              />
            )}

          <Portal>
            <div
              className={classnames(classes.viewerOverlay, {
                [classes.viewerOverlayActive]: viewerActive
              })}
            >
              <ReactPinchZoomPan
                {...reactPinchZoomPanOptions}
                render={obj => {
                  return (
                    <div
                      style={{
                        overflow: 'hidden',
                        position: 'relative',
                        height: '100%'
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          height: '100%'
                        }}
                        className={classnames({
                          [classes.playButton]: selectedImage.video,
                          [classes.playing]: this.state.playingVideo
                        })}
                        onClick={() => {
                          if (this.selectedVideo) {
                            if (this.selectedVideo.paused) {
                              this.selectedVideo.play()
                              this.setState({ playingVideo: true })
                            } else {
                              this.selectedVideo.pause()
                              this.setState({ playingVideo: false })
                            }
                          }
                        }}
                      >
                        {selectedImage && (
                          <SelectedImageTag
                            ref={el => {
                              if (selectedImage.video) {
                                this.selectedVideo = el
                              }
                            }}
                            src={selectedImage.zoomSrc || selectedImage.src}
                            alt={selectedImage.alt}
                            style={{
                              width: '100%',
                              height: 'auto',
                              transform: `scale(${obj.scale}) translateY(${obj.y}px) translateX(${
                                obj.x
                              }px)`
                            }}
                          />
                        )}
                      </div>
                    </div>
                  )
                }}
              />
              {viewerActive && this.renderViewerToggle()}
              {viewerActive && this.renderThumbnails()}
            </div>
          </Portal>
          {!viewerActive && this.renderViewerToggle()}
        </div>

        {!viewerActive && !viewerThumbnailsOnly && this.renderThumbnails()}
      </div>
    )
  }

  onFullSizeImagesLoaded = () => {
    this.setState({ fullSizeImagesLoaded: true })
    this.props.app.applyState({ loadingProduct: null })
  }
}

class ImageMagnify extends Component {
  constructor() {
    super()

    this.state = {
      primaryNotFound: false,
      zoomPrimaryNotFound: false
    }

    this.ref = createRef()
  }

  componentDidMount() {
    const img = this.ref.current

    if (img && img.complete && img.naturalWidth === 0) {
      this.setState({ primaryNotFound: true })
    }
  }

  render() {
    const { primaryNotFound, zoomPrimaryNotFound } = this.state

    let {
      src,
      alt,
      zoomSrc,
      zoomWidth,
      zoomHeight,
      onLoad,
      notFoundSrc,
      magnifyProps,
      imageProps
    } = this.props

    if ((primaryNotFound || zoomPrimaryNotFound) && notFoundSrc) {
      // if either is not found, just do a standard Image:
      return (
        <Image
          notFoundSrc={notFoundSrc}
          src={primaryNotFound ? notFoundSrc : src}
          alt={alt}
          onLoad={onLoad}
          {...imageProps}
        />
      )
    }

    src = Image.getOptimizedSrc(src, get(imageProps, 'quality'), get(imageProps, 'optimize'))
    zoomSrc = Image.getOptimizedSrc(
      zoomSrc,
      get(imageProps, 'quality'),
      get(imageProps, 'optimize')
    )

    return (
      <ReactImageMagnify
        enlargedImagePosition="over"
        {...magnifyProps}
        smallImage={{
          src,
          alt: alt,
          isFluidWidth: true,
          onLoad: onLoad,
          onError: () => this.setState({ primaryNotFound: true })
        }}
        largeImage={{
          src: zoomSrc,
          width: zoomWidth,
          height: zoomHeight,
          onError: () => this.setState({ zoomPrimaryNotFound: true })
        }}
      />
    )
  }
}

/**
 * Converts an array that can contain strings or MediaTypeModel instances into
 * an array of objects with src, alt, and video
 * @private
 * @param {Object} props
 * @param {String} key "images" or "thumbnails"
 */
function normalizeImages(props, key) {
  const { product } = props
  const productName = product && product.name
  let images = props[key]

  if (!images || !images.length) {
    images = product && product[key]
  }

  return !images
    ? []
    : images.map(e => {
        if (typeof e === 'string') {
          return { src: e, alt: productName, video: false }
        } else {
          return { ...e, alt: e.alt || productName }
        }
      })
}
