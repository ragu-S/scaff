import React from 'react';
import animate from 'gsap-promise';
import SVGContainer from '../../SVGContainer/SVGContainer';
import SpeedCircle from '../../SpeedCircle/SpeedCircle';
import detect from '../../../util/detect';
import sounds from '../../../util/sounds';
import bindKeys from '../../../util/bind-keys';
import classnames from 'classnames';

const hoverAnimationMap = {
  sweat: 0.2,
  step: 0.4,
  sleep: 1.25,
  sit: 0.75
};

export default class ActivityItem extends React.Component {
  static propTypes = {
    onClick: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func
  };

  static defaultProps = {
    onClick() {},
    onMouseEnter() {},
    onMouseLeave() {}
  };

  constructor(props) {
    super(props);

    this.state = {
      isMouseOver: false
    };
    this.willUnmount = false;
  }

  componentDidMount() {
    if(!detect.isPhone && !this.props.isSelected) {
      animate.set(this.selectedIndicator, { scale: 0.9 });
    }

    if(this.props.isAnimatingIn && !this.props.isSimpleAnimation) {
      this.setOut();
    }
  }

  componentWillUnmount() {
    TweenMax.killTweensOf([ this.component, this.icon, this.text ]);
    this.willUnmount = true;
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.isSelected !== nextProps.isSelected && detect.isDesktop) {
      if(nextProps.isSelected) {
        this.animateMouseLeave(nextProps);
        this.handleSelect();

      } else if(this.state.isMouseOver) {
        this.handleHoverAnimation(nextProps);
      } else {
        this.animateMouseLeave(nextProps);
      }

      this.setState({
        recentlyUnselected: this.props.isSelected && !nextProps.isSelected
      });
      // if(this.props.isSelected) console.log('aria tag hints set to:', this.props.isSelected && !nextProps.isSelected);
    }
  }

  animateIn = async (delay = 0) => {
    const baseDelay = (this.props.index * 0.15) + delay;

    if(!this.props.isAnimatingIn) {
      return Promise.resolve();
    }

    if(this.props.isSimpleAnimation) {
      return animate.fromTo(this.component, 0.3, { opacity: 0 }, { delay: delay || 0.5, opacity: 1 });
    }

    return animate.all([
      animate.to(this.icon, 0.7, { delay: baseDelay, rotation: 0, ease: Back.easeOut, easeParams: [1.5] }),
      animate.to(this.icon, 1, { delay: baseDelay, y: '0%', scale: 1, ease: Expo.easeOut }),
      animate.to(this.icon, 0.6, { delay: baseDelay, opacity: 1, ease: Quad.easeOut }),
      animate.to(this.text, 1, { delay: baseDelay + 0.3, opacity: 1, y: '0%', ease: Expo.easeOut, easeParams: [0.75] })
    ]);
  }

  animateOut = () => {
    return animate.to(this.component, 0.3, { opacity: 0 });
  }

  setIdle = () => {
    return animate.all([
      animate.set(this.icon, { opacity: 1, y: '0%', rotation: 0, scale: 1 }),
      animate.set(this.text, { opacity: 1, y: '0%' })
    ]);
  }

  setOut = () => {
    return animate.all([
      animate.set(this.icon, { opacity: 0, y: '50%', rotation: -90, scale: 0.5, transformOrigin: '50% 100%' }),
      animate.set(this.text, { opacity: 0, y: '150%' })
    ]);
  }

  handleClick = () => {
    sounds.activityClick.play();
    this.props.onClick(this.props.id, this.props.isSelected);
  }

  handleMouseEnter = () => {
    sounds.activityHover.play();
    this.handleHoverAnimation(this.props);
    this.props.onMouseEnter(this.props.id);
  }

  handleMouseLeave = async () => {
    this.animateMouseLeave(this.props, true);
    this.props.onMouseLeave(this.props.id);
  }

  handleBlur = () => {
    this.animateMouseLeave(this.props, false);
  }

  animateMouseLeave = async (props, isMouseLeave) => {
    if(!props.isSelected) {
      TweenMax.killTweensOf(this.selectedIndicator);
      animate.to(this.selectedIndicator, 0.3, { scale: 0.9 });
    }

    if(this.speedIcon) {
      await this.speedIcon.animateOut();
    }

    if(this.willUnmount) return;
    isMouseLeave && this.setState({ isMouseOver: false });
  }

  handleHoverAnimation = (props) => {
    if(!props.isSelected) {
      this.animatePulse(hoverAnimationMap[props.speed.id]);
    }

    this.setState({ isMouseOver: true }, () => this.speedIcon.animateIn());
  }

  handleSelect = () => {
    TweenMax.killTweensOf(this.selectedIndicator);
    animate.to(this.selectedIndicator, 0.3, { scale: 1 });
  }

  animatePulse = async (duration, d = 1) => {
    if(this.props.isSimpleAnimation) {
      return animate.to(this.selectedIndicator, duration, { scale: 1.15 });
    }

    TweenMax.killTweensOf(this.selectedIndicator);
    await animate.to(this.selectedIndicator, duration, { z: 0, scale: d === 1 ? 1.15 : 1.10 });
    if(this.willUnmount) return;
    return this.animatePulse(duration, d * -1);
  }

  handleKeyDown = bindKeys({
    onDown: (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.props.onFocusBelow(this.props.id);
    },
    onUp: (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.props.onFocusAbove(this.props.id);
    },
    onLeft: (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.props.onFocusLeft(this.props.id);
    },
    onRight: (e) => {
      e.stopPropagation();
      e.preventDefault();
      this.props.onFocusRight(this.props.id);
    }
  })

  render() {
    const speedClass = 'activity-' + this.props.speed.id;
    const ariaLabel = `${this.props.isSelected ? __('accessibility.removeActivity') : ''} ${this.props.name}`;

    return (
      <div
        id={`anchor-${this.props.id}`}
        ref={ref => this.component = ref}
        className={classnames("activity-item", { selected: this.props.isSelected, disabled: this.props.isDisabled })}
      >
        <button
          id={this.props.id}
          ref={ ref => this.icon = ref }
          className="activity-icon"
          onMouseEnter={detect.isDesktop ? this.handleMouseEnter : null}
          onMouseLeave={detect.isDesktop ? this.handleMouseLeave : null}
          onFocus={detect.isDesktop ? this.handleMouseEnter : null}
          onBlur={detect.isDesktop ? this.handleBlur : null}
          onKeyDown={this.handleKeyDown}
          onClick={this.handleClick}
          tabIndex="-1"
          aria-label={ariaLabel}
        >
          <div
            className="activity-icon-content"
          >
            <SVGContainer
              className="dotted-circle"
              svg="dotted-circle"
            />
            {
              this.state.isMouseOver || detect.isMobile
                ? <SpeedCircle
                ref={ ref => this.speedIcon = ref }
                speed={this.props.speed.id}
              />
                : null
            }
            <div
              ref={ ref => this.selectedIndicator = ref }
              className={ "selection-overlay back " + speedClass}
            />
            <div
              className={ "selection-overlay front " + speedClass}
            />
            {
              detect.isDesktop
                ? <SVGContainer
                    className="trash-icon"
                    svg="trash"
                    role="presentation"
                    aria-hidden="true"
                  />
                : null
            }
            <SVGContainer
              className="icon-container"
              svg={this.props.id}
            />
          </div>
        </button>
        {
          detect.isDesktop && (this.props.isSelected || this.state.recentlyUnselected) &&
          <span style={{ width: '1px', height: '1px' }} role="alert"
            aria-label={`${__(this.state.recentlyUnselected ? 'accessibility.removedActivity' : 'accessibility.selected')} ${this.props.name}`} />
        }
        <p aria-hidden="true" ref={ref => this.text = ref}><span aria-hidden="true">{ this.props.name }</span></p>
      </div>
    );
  }
}

