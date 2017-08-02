import React from 'react';
import { findDOMNode } from 'react-dom';
import animate from 'gsap-promise';
import detect from '../../util/detect';
import sounds from '../../util/sounds';
import Snap from 'snapsvg';
import Tabs from './Tabs/Tabs';
import Dropdown from './Dropdown/Dropdown';
import Grid from './Grid/Grid';
import BezierEasing from 'bezier-easing';

const drawerCurveEase = {
  idle: new BezierEasing(0.72, 0.00, 0.36, 1.00),
  curveBendDown: new BezierEasing(0.90, 0.00, 0.53, 1.00),
  out: new BezierEasing(0.60, 0.00, 0.17, 1.00)
};

const drawerSvgPaths = {
  init: 'M0,40 C300,0 500,0 800,40 L800,300 L0,300 L0,0', // Curve down
  idle: 'M0,10 L800,10 L800,300 L0,300 L0,0', // Flat
  close: 'M0,10 C300,40 500,40 800,10 L800,300 L0,300 L0,0' // Curve up
};

const allCategory = {
  id: 'category-all',
  name: 'app.category.all',
  icon: 'category-all',
  svg: 'category-all',
  color: '#cf3e39'
};

export default class ActivityGrid extends React.Component {
  static propTypes = {
    activities: React.PropTypes.array,
    selectedActivities: React.PropTypes.array,
    handleActivityClick: React.PropTypes.func,
    color: React.PropTypes.string,
    attachRef: React.PropTypes.func,
    isSelectDisabled: React.PropTypes.bool,
    onActivityMouseEnter: React.PropTypes.func,
    onActivityMouseLeave: React.PropTypes.func
  };

  static defaultProps = {
    activities: [],
    selectedActivities: [],
    handleActivityClick() {},
    attachRef() {},
    color: '#0aa278',
    isSelectDisabled: false,
    onActivityMouseEnter() {},
    onActivityMouseLeave() {}
  };

  constructor(props) {
    super(props);

    this.isSimpleAnimation = detect.isIE11 || detect.isTablet;

    this.categories = this.getCategories(this.props.time, this.props.speeds);

    let initialCategory = this.categories[0];

    if(props.activityIdToScrollTo) {
      const activity = this.props.activities.find(activity => activity.id === props.activityIdToScrollTo);
      initialCategory = this.categories.find(c => c.id === activity.speedId) || initialCategory;
    }

    this.activityItems = [];
    this.state = {
      selectedCategoryId: initialCategory.id,
      selectedColor: initialCategory.color,
      activities: this.getActivities(initialCategory.id),
      activityIdToScrollTo: this.props.activityIdToScrollTo
    };
  }

  componentDidMount() {
    if(!detect.isPhone && !this.isSimpleAnimation) {
      this.drawerSnapSvg = new Snap(this.drawerSvg);
      this.drawerPath = this.drawerSnapSvg.select('path');
    }

    this.setInitialState();

    // Attach ref within TransitionGroup child
    this.props.attachRef(this);
  }

  componentWillAppear(done) {
    if(!detect.isPhone && !this.isSimpleAnimation) {
      this.drawerPath.stop().animate( { 'path' : drawerSvgPaths.idle }, 0);
    }
    if(!this.isSimpleAnimation) animate.set(this.topMask, { autoAlpha: 1 });
    animate.set(this.grid, { y: '0%' }).then(done);
  }

  componentWillEnter(done) {
    this.animateIn().then(done);
  }

  componentWillLeave(done) {
    this.animateOut().then(done);
  }

  setInitialState = async () => {
    TweenMax.set([ this.component, this.grid ], { clearProps: 'all' });

    if(this.isSimpleAnimation) {
      this.topMask = {};
      return animate.set(this.grid, { opacity: 0 });
    }

    if(!detect.isPhone) {
      this.drawerPath.stop().animate( { 'path' : drawerSvgPaths.init }, 0);
      await this.categoryUI.setOut();
    }

    return animate.all([
      animate.set(this.topMask, { autoAlpha: 0 }),
      animate.set(detect.isPhone ? this.component : this.grid, { y: '101%' })
    ]);
  }

  getCategories = (time, speeds) => {
    let categories = Object.keys(speeds).map(key => speeds[key]);

    if(time === 'night') {
      return categories.filter(x => x.id === 'sleep');
    } else {
      return [
        allCategory,
        ...categories.filter(x => x.id !== 'sleep')
      ];
    }
  }

  animateIn = async () => {
    const delay = 1;
    const duration = 0.5;
    const snapDelay = duration * 600;
    await this.setInitialState();

    if(!detect.isPhone && !this.isSimpleAnimation) {
      setTimeout(() => {
        this.drawerPath.stop().animate( { 'path' : drawerSvgPaths.idle }, 1650, mina.elastic);
      }, snapDelay + (delay * 1000));
    }

    return animate.to({}, delay)
    .then(() => animate.all([
        this.categoryUI.animateIn ? this.categoryUI.animateIn() : Promise.resolve(),
        this.animateInGrid(duration)
      ])
    ).then(() => animate.set(this.topMask, { delay: 1, autoAlpha: 1 }));
  }

  animateInGrid = async (duration) => {

    if(this.isSimpleAnimation) {
      await animate.set({}, { delay: 0.5 });
      this.playSound();
      return animate.to(this.grid, 0.7, { opacity: 1 });
    }

    await animate.set({}, { delay: 0.1 });
    this.playSound();
    return animate.to(detect.isPhone ? this.component : this.grid, duration, { y: '0%', ease: drawerCurveEase.idle });
  }

  animateOut() {
    if(detect.isPhone) return Promise.resolve();

    if(this.isSimpleAnimation) {
      this.playSound();
      return animate.to(this.component, 0.5, { opacity: 0 });
    }

    setTimeout(() => {
      animate.to(this.topMask, 0.3, { autoAlpha: 0 });
      animate.to(this.gridContainer, 0.2, { bottom: '-10%', ease: drawerCurveEase.curveBendDown });
      this.drawerPath.stop().animate( { 'path' : drawerSvgPaths.close }, 200, drawerCurveEase.curveBendDown);
      this.playSound();
    }, 1000);

    return animate.all([
      animate.to(this.scrollContainer.component, 0.25, {
        opacity: 0,
        delay: 0.9
      }),
      animate.to(this.component, 0.73, { y: '100%', ease: drawerCurveEase.out, delay: 1 }),
      this.categoryUI.animateOut()
    ])
    .then(() => animate.set([this.topMask,this.gridContainer], { clearProps: 'autoAlpha,bottom' }));
  }

  playSound = () => {
    if(detect.isDesktop) {
      sounds.drawerToggle.play();
    }
  }

  handleCategoryChange = (id) => {
    if(this.state.selectedCategoryId !== id) {
      TweenMax.killTweensOf(this.grid);
      this.setCategory(id);
    }
  }

  getActivities = (id) => {
    if(id === allCategory.id) return this.props.activities;

    return this.props.activities.filter(activity => activity.speedId === id);
  }

  scrollToActivity = async (id) => {
    const activity = this.props.activities.find(activity => activity.id === id);
    const category = this.categories.find((category) => {
      return activity && activity.speedId === category.id;
    });

    if(!category) return;

    if(this.state.selectedCategoryId !== 'all' && this.state.selectedCategoryId !== category.id) {
      this.setCategory(category.id, id);
    } else {
      this.scrollToAnchor(id, category);
    }
  }

  scrollToAnchor = async (id, category) => {
    const el = document.getElementById(`anchor-${id}`);
    if(!el) return Promise.resolve();
    const clientRect = el.getBoundingClientRect();
    const offsetTop = detect.isPhone ? 50 : (window.innerWidth * 0.035);
    return category
      ? animate.to(this.scrollContainer.component, 0.6, { scrollTop: clientRect.top - (window.innerHeight - this.scrollContainer.component.offsetHeight) + this.scrollContainer.component.scrollTop - offsetTop, ease: Quad.easeOut })
      : Promise.resolve();
  }

  setCategory = (id, activityIdToScrollTo) => {
    if(this.state.selectedCategoryId !== id) {
      this.setState({ selectedCategoryId: id, activities: this.getActivities(id), activityIdToScrollTo });
    }
  }

  render() {
    const selectedColor = this.props.color;
    const hoverColor = this.props.hoverColor;
    const FilterComponent = !detect.isPhone ? Tabs : Dropdown;

    return (
      <div
        className="activity-grid"
        ref={ref => this.component = findDOMNode(ref)}
      >
        <div className="grid-wrapper" ref={ref => this.grid = findDOMNode(ref)}>
          {
            !detect.isPhone
            ? <svg xmlns="http://www.w3.org/2000/svg" className="drawer-top" ref={ ref => this.drawerSvg = ref } viewBox="0 0 800 300">
                <path strokeMiterlimit="10" d={ this.isSimpleAnimation ? drawerSvgPaths.idle : drawerSvgPaths.init } />
              </svg>
            : null
          }
          <div className="grid-container" ref={el => this.gridContainer = el } >
            {
              !this.isSimpleAnimation && <div ref={ ref => this.topMask = ref } className="top-mask" />
            }
            <Grid
              id={this.state.selectedCategoryId}
              selectedCategoryId={this.state.selectedCategoryId}
              isSelectedDisabled={this.props.isSelectDisabled}
              selectedActivities={this.props.selectedActivities.map(id => this.props.activities.find(x => x.id === id)).filter(Boolean)}
              activities={this.state.activities}
              onActivityClick={this.props.onActivityClick}
              onScrollToActivity={this.scrollToActivity}
              activityIdToScrollTo={this.state.activityIdToScrollTo}
              ref={ ref => this.scrollContainer = ref }
              isSimpleAnimation={this.isSimpleAnimation}
              isFrench={this.props.isFrench}
              onActivityMouseEnter={this.props.onActivityMouseEnter}
              onActivityMouseLeave={this.props.onActivityMouseLeave}
            />
          </div>
        </div>
        <FilterComponent
          ref={ ref => this.categoryUI = ref }
          items={this.categories}
          selectedItemId={this.state.selectedCategoryId}
          selectedColor={this.categories.find(c => c.id === this.state.selectedCategoryId).color}
          hoverColor={hoverColor}
          hoverColors={this.props.hoverColors}
          onItemClick={this.handleCategoryChange}
          isSimpleAnimation={this.isSimpleAnimation}
        />
      </div>
    );
  }
}
