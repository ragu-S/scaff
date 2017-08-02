import React from 'react';
import LazyLoader from '../../LazyLoader/LazyLoader';
import ActivityItem from '../ActivityItem/ActivityItem';
import animate from 'gsap-promise';
import speeds from '../../../models/speeds';

const noop = () => {
};

export default class Grid extends React.Component {

  static propTypes = {
    selectedActivities: React.PropTypes.array,
    onActivityMouseEnter: React.PropTypes.func,
    onActivityMouseLeave: React.PropTypes.func
  };

  static defaultProps = {
    selectedActivities: [],
    onActivityMouseEnter() {},
    onActivityMouseLeave() {}
  };

  constructor(props) {
    super(props);
    this.items = {};

    this.initialLimit = detect.isPhone ? 16 : 15;
    this.loadQuantity = this.props.isSimpleAnimation ? 5 : 20;

    this.state = {
      disableLazyLoad: true,
      activities: this.orderActivities(props.activities, props.selectedCategoryId, props.selectedActivities).slice(0, this.initialLimit),
      selectedCategoryId: props.selectedCategoryId,
      initialSelectedActivities: props.selectedActivities
    };
  }

  componentDidMount () {
    const delay = this.props.activityIdToScrollTo ? 0 : 2.8;

    this.getButtonReferences();

    this.animateInItems(this.props, delay, () => {
      if (this.props.activityIdToScrollTo) {
        this.props.onScrollToActivity(this.props.activityIdToScrollTo);
      }

      this.getButtonReferences();
    }, false);
  }

  async componentWillReceiveProps(nextProps) {
    if (this.props.id !== nextProps.id) {
      const delay = nextProps.activityIdToScrollTo || this.props.isSimpleAnimation ? 0 : 0.5;

      await this.animateOutItems(nextProps);

      this.getButtonReferences();

      this.animateInItems(nextProps, delay, () => {
        if (nextProps.activityIdToScrollTo) {
          this.props.onScrollToActivity(nextProps.activityIdToScrollTo);
        }

        this.getButtonReferences();
      });
    }
  }

  getButtonReferences = () => {
    this.buttons = [...this.component.loader.querySelectorAll('button')];
  }

  animateInItems = async ({activities, selectedCategoryId}, delay = 0, onComplete = noop) => {
    const activityComponents = this.state.selectedCategoryId === 'category-all'
      ? this.state.initialSelectedActivities.filter(Boolean).concat(this.state.activities)
      : this.state.activities;

    const promise = animate.all(activityComponents.map((x, i) => this.items[i].animateIn(delay)));

    await promise;

    if (this.state.activities.length !== activities.length || selectedCategoryId !== this.state.selectedCategoryId) {
      const nextActivities = this.orderActivities(activities, selectedCategoryId, this.state.initialSelectedActivities);
      this.setState({
        disableLazyLoad: false,
        activities: nextActivities.slice(0, this.state.activities.length + this.loadQuantity),
        selectedCategoryId
      }, onComplete);
    } else {
      onComplete();
    }
  }

  animateOutItems = async ({activities, selectedCategoryId, activityIdToScrollTo, selectedActivities}) => {
    const promise = animate.all(this.state.activities.map((x, i) => this.items[i].animateOut()));

    await promise;

    this.component.scrollTo(0);

    return new Promise((resolve) => {
      this.setState({
        disableLazyLoad: true,
        activities: this.orderActivities(activities, selectedCategoryId, selectedActivities).slice(0, activityIdToScrollTo ? 999 : this.initialLimit),
        initialSelectedActivities: selectedActivities,
        selectedCategoryId
      }, resolve);
    });
  }

  orderActivities(activities, selectedCategoryId, initialSelectedActivities = []) {
    if (selectedCategoryId !== 'category-all' || !this.props.selectedActivities.length) return activities;
    return activities.filter(activity => !initialSelectedActivities.find(x => activity.id === x.id));
  }

  scrollToAnchor = (id, category) => {
    const el = document.getElementById(`anchor-${id}`);
    if (!el) return Promise.resolve();
    const clientRect = el.getBoundingClientRect();
    const offsetTop = detect.isPhone ? 50 : 20;
    return category
      ? animate.to(this.scrollContainer, 0.6, {
        scrollTop: clientRect.top - (window.innerHeight - this.scrollContainer.offsetHeight) + this.scrollContainer.scrollTop - offsetTop,
        ease: Quad.easeOut
      })
      : Promise.resolve();
  }

  handleContentLoad = () => {
    this.setState(({activities}) => {
      const nextActivities = this.orderActivities(this.props.activities, this.state.selectedCategoryId, this.state.initialSelectedActivities);

      return {
        activities: nextActivities.slice(0, activities.length + this.loadQuantity)
      };
    }, this.getButtonReferences);
  }

  handleFocusLeft = (id) => {
    const index = this.buttons.findIndex(btn => btn.id === id);
    const item = this.buttons[index - 1];
    item && item.focus();
  }

  handleFocusRight = (id) => {
    const index = this.buttons.findIndex(btn => btn.id === id);
    const item = this.buttons[index + 1];
    item && item.focus();
  }

  handleFocusBelow = (id) => {
    const index = this.buttons.findIndex(btn => btn.id === id);
    const item = this.buttons[index + 5];
    item && item.focus();
  }

  handleFocusAbove = (id) => {
    const index = this.buttons.findIndex(btn => btn.id === id);
    const item = this.buttons[index - 5];
    item && item.focus();
  }

  render() {
    const disableLazyLoad = this.state.disableLazyLoad || this.props.activities.length === this.state.activities.length;
    const selectedActivities = this.props.selectedActivities.filter(Boolean);
    const activities = this.state.selectedCategoryId === 'category-all'
      ? this.state.initialSelectedActivities.filter(Boolean).concat(this.state.activities)
      : this.state.activities;

    return (
      <LazyLoader
        onLoad={this.handleContentLoad}
        disable={disableLazyLoad}
        className="grid" ref={ ref => this.component = ref }
        role="tabpanel"
        tabIndex="0"
        component="ul"
        ariaHidden="false"
        ariaLabel={__('accessibility.drawerAllButton')}
      >
        {
          activities.map((activity, i) =>
            <ActivityItem
              key={this.state.selectedCategoryId + '-' + i}
              ref={ref => this.items[i] = ref}
              isDisabled={this.props.isSelectDisabled}
              isSelected={Boolean(selectedActivities.find(x => x.id === activity.id))}
              index={i + 1}
              {...activity}
              name={this.props.isFrench ? activity.name.fr : activity.name.en}
              isAnimatingIn={!this.props.activityIdToScrollTo && i < this.initialLimit}
              onClick={this.props.onActivityClick}
              speed={speeds[activity.speedId]}
              isSimpleAnimation={this.props.isSimpleAnimation}
              onFocusBelow={this.handleFocusBelow}
              onFocusAbove={this.handleFocusAbove}
              onFocusLeft={this.handleFocusLeft}
              onFocusRight={this.handleFocusRight}
              onMouseEnter={this.props.onActivityMouseEnter}
              onMouseLeave={this.props.onActivityMouseLeave}
            />
          )
        }
      </LazyLoader>
    );
  }
}
