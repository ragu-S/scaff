componentWillAppear(done) {
  // Called right after componentDidMount was called
  done();
}

componentDidAppear() {
 // Called when done() is called on componentWillAppear
}

componentWillEnter(done) {
  // Called when component just entered the group
  done();
}

componentDidEnter() {
  // Called right after componentWillEnter's done() was called
}

componentWillLeave(done) {
  // Called when component is leaving the group
  done();
}

componentDidLeave() {
  // Called after done() is called in componentWillLeave, this called right after componentWillUnmount
}

