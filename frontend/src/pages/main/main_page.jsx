import React from "react";

import VideoPage from '../video/video_page';


export default class MainPage extends React.Component {
  componentWillMount() {
  }

  render() {
    return (
      <div id="landing-page">
        <h1>working</h1>
        <VideoPage />
      </div>
    );
  }
}
