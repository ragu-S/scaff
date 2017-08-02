import React from 'react';
import { findDOMNode } from 'react-dom';
import Icon from '../../Icon/Icon';
import animate from 'gsap-promise';
import classnames from 'classnames';
import Tilt from '../../Tilt/Tilt';
import SVGContainer from '../../SVGContainer/SVGContainer';
import BezierEasing from 'bezier-easing';
import animations from '../../../util/animations';
import sounds from '../../../util/sounds';
// import bindKeys from '../../../util/bind-keys';

const easeA = new BezierEasing(0.90, 0.00, 0.53, 1.00);
const easeC = new BezierEasing(0.64, 0.00, 0.53, 1.00);

const eases = {
  idle: {
    scale: easeA,
    width: Back.easeOut,
    text: easeA
  },
  out: {
    initial: easeC,
    after: easeA
  }
};

@Tilt
class Tab extends React.Component {

  componentWillMount() {
    this.isAnimatingIn = true;
  }

  componentWillReceiveProps(nextProps) {
    if(this.props.isSelected !== nextProps.isSelected) {
      if(nextProps.isSelected) {
        !this.props.isSimpleAnimation && this.icon.playLoop();
        animate.set(this.text, { color: this.props.selectedColor });
      } else {
        !this.props.isSimpleAnimation && this.icon.stopLoop();
        animate.set(this.text, { clearProps: 'color' });
      }
    }
  }

  animateIn = async () => {
    const items = this.component.querySelectorAll('.animate-el');
    this.icon.play();

    return animate.all([
      animate.to(this.mask, 0.5, { scale: 1, ease: eases.idle.scale }),
      animate.to(this.mask, 0.7, { delay: 0.5, width: '100%', ease: eases.idle.width, easeParams:[0.85] }),
      animate.staggerFromTo(items, 1, { autoAlpha: 0, y: '150%' }, { delay: 0.35, autoAlpha: 1, y: '0%', ease: eases.idle.text }, 0.12)
    ]).then(() => this.isAnimatingIn = false);
  }

  animateOut = async () => {
    TweenMax.killTweensOf(this.component);

    await animate.to(this.component, 0.4, {
      scale: 1.05,
      ease: eases.out.initial
    });

    return animate.to(this.component, 0.4, {
      scale: 0,
      ease: eases.out.after,
      delay: 0.1
    });
  }

  handleMouseEnter = async () => {
    if(this.isAnimatingIn) return;

    const iconEl = !this.props.isSimpleAnimation ? findDOMNode(this.iconEl) : this.iconEl;
    const slotEls = [ this.wrapper, this.text ];

    sounds.hover.play();

    if(!this.props.isSimpleAnimation) {
      const paths = iconEl.querySelectorAll('path');
      const colorEls = [ paths, this.text ];

      animate.to(colorEls, 0.3, { css: { stroke: this.props.hoverColor, color: this.props.hoverColor } });
      animate.set(this.text, { color: this.props.hoverColor });
      animations.slot(slotEls, { delay: 0.1, y: 50, onAnimatedOut: () => !this.props.isSimpleAnimation && this.icon.playFrom(0, false, 0) });
    } else {
      animate.to(this.text, 0.3, { color: this.props.hoverColor });
      this.iconEl.setColor({ color: this.props.hoverColor });
    }
  }

  handleMouseLeave = () => {
    if(this.isAnimatingIn) return;

    const iconEl = !this.props.isSimpleAnimation ? findDOMNode(this.iconEl) : this.iconEl;
    const color = '#686868';

    if(!this.props.isSimpleAnimation) {
      const paths = iconEl.querySelectorAll('path');
      const colorEls = [ paths, this.text ];
      animate.to(colorEls, 0.3, { stroke: color, color });
    } else {
      animate.to(this.text, 0.3, { color });
      this.iconEl.setColor(color);
    }
  }

  onClick = () => {
    sounds.click.play();
    this.props.onClick();
  }

  render() {
    const style = {
      color: this.props.isSelected ? this.props.selectedColor : undefined
    };

    return (
      <li
        key={this.props.id}
        ref={ ref => this.component = ref }
        className={classnames("tab", { selected: this.props.isSelected })}
        role="presentation"
        aria-hidden={true}
      >
        <button
          className="tab-wrapper"
          onClick={this.onClick}
          onMouseEnter={detect.isDesktop && !this.props.isSelected && this.handleMouseEnter}
          onMouseLeave={detect.isDesktop && !this.props.isSelected && this.handleMouseLeave}
          onFocus={detect.isDesktop && !this.props.isSelected && this.handleMouseEnter}
          onBlur={detect.isDesktop && !this.props.isSelected && this.handleMouseLeave}
          tabIndex="-1"
          aria-hidden={true}
        >
          <div className="tab-mask" ref={ ref => this.mask = ref } aria-hidden="true">
            <div className="tab-content" aria-hidden="true">
              <div ref={ ref => this.wrapper = ref }>
                {
                  !this.props.isSimpleAnimation
                  ? <Icon
                      className={classnames("tab-icon animate-el", this.props.svg)}
                      ref={ ref => { this.icon = ref; this.iconEl = findDOMNode(ref); }}
                      id={this.props.id}
                      color={this.props.isSelected ? this.props.selectedColor : '#686868'}
                      delay={0.7}
                      loop={this.props.isSelected}
                      autoplay={false}
                      role="presentation"
                      ariaHidden="true"
                    />
                  : <SVGContainer
                      ref={ ref => this.iconEl = ref }
                      className={classnames("tab-icon animate-el", this.props.svg)}
                      svg={this.props.svg}
                      color={this.props.isSelected ? this.props.selectedColor : '#686868'}
                    />
                }
              </div>
              <span aria-hidden="true" className="animate-el" ref={ ref => this.text = ref } style={style}>{__(this.props.name)}</span>
            </div>
          </div>
        </button>
      </li>
    );
  }
}

export default class Tabs extends React.Component {
  static propTypes = {
    items: React.PropTypes.array,
    selectedItemId: React.PropTypes.string,
    selectedColor: React.PropTypes.string,
    onItemClick: React.PropTypes.func
  }

  static defaultProps = {
    onItemClick() {}
  }

  componentDidMount() {
    this.buttons = [ ...this.component.querySelectorAll('button') ];
    this.setOut();
  }

  shouldComponentUpdate(nextProps) {
    return this.props.selectedItemId !== nextProps.selectedItemId;
  }

  setOut = () => {
    if(this.props.isSimpleAnimation) {
      return animate.set(this.component, { opacity: 0 });
    }

    const masks = [ ...this.component.querySelectorAll('.tab-mask') ];
    TweenMax.killTweensOf(masks);
    return animate.all(masks.map(mask => animate.set(mask, { scale: 0, width: `${(mask.offsetHeight / mask.offsetWidth) * 100}%` })));
  }

  animateIn = () => {
    if(this.props.isSimpleAnimation) {
      return animate.to(this.component, 0.3, { delay: 0.8, opacity: 1 });
    }

    const masks = [ ...this.component.querySelectorAll('.tab-mask') ];
    TweenMax.killTweensOf(masks);
    return animate.all(this.props.items.map( async (item, i) => {
      const tab = this[`tab-${item.id}`];
      await animate.set({}, { delay: (i * 0.1) + 0.2 });
      return tab.animateIn();
    }))
    .then(() => {
      this.buttons[0].focus();
    });
  }

  animateOut = () => {
    const tabs = [ ...this.component.querySelectorAll('.tab-mask') ];
    TweenMax.killTweensOf(tabs);

    return animate.all(this.props.items.map( async (item, i) => {
      const tab = this[`tab-${item.id}`];
      await animate.set({}, { delay: 0.03 * (1 + i) });
      return tab.animateOut();
    }));
  }

  // handleKeyDown = bindKeys({
  //   onDown: () => {
  //     const activityItem = this.component.parentNode.querySelector('.activity-item button');
  //     activityItem.focus();
  //   },
  //   onLeft: (e) => {
  //     const index = this.buttons.findIndex(btn => btn === e.target);
  //     const nextIndex = (index <= 0 ? this.buttons.length : index) - 1;
  //     this.buttons[nextIndex].focus();
  //   },
  //   onRight: (e) => {
  //     const index = this.buttons.findIndex(btn => btn === e.target);
  //     const nextIndex = (index + 1) % this.buttons.length;
  //     this.buttons[nextIndex].focus();
  //   }
  // })

  render() {
    return (
      <ul
        className="tabs" ref={ ref => this.component = ref }
        // onKeyDown={this.handleKeyDown}
        role="tablist"
        aria-hidden="true"
      >
      {
        this.props.items.map((item, i) => {
          return (
            <Tab
              key={item.id}
              { ...item }
              ref={ ref => this['tab-' + item.id] = ref }
              onClick={() => this.props.onItemClick(item.id)}
              selectedColor={item.color}
              hoverColor={item.color}
              isSelected={this.props.selectedItemId === item.id}
              isSimpleAnimation={this.props.isSimpleAnimation}
              ariaEnabled={i === 0}
            />
          );
        })
      }
      </ul>
    );
  }
}
