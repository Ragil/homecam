import React from 'react';
import WebRTC from 'src/common/webrtc';
import '!style!css!less!./video_page.less';


export default class VideoPage extends React.Component {
  constructor(props, context) {
    super(props, context);
    this.state = {
      remote : {}
    };
  }

  componentDidMount() {
    this.showVideo();
  }

  componentDidUpdate() {
    this.showVideo();
  }

  showVideo() {
    if (!this.webrtc) {
      let local = React.findDOMNode(this.refs.videoLocal);

      this.webrtc = new WebRTC({
        initialized : this.webRTCInitialized.bind(this),
        initError : this.webRTCInitError.bind(this),
        localVideoEl : local,
        autoRequestMedia : true
      });
    }
  }

  webRTCInitialized(webrtc) {
    webrtc.on('readyToCall', function() {
      webrtc.joinRoom('3c60446b6ad0cf9e144014c3d5cb7b53');
    });

    webrtc.on('videoAdded', this.videoAdded.bind(this));
    webrtc.on('videoRemoved', this.videoRemoved.bind(this));
  }

  webRTCInitError(webrtc, error) {
    // show error
  }

  videoAdded(video, peer) {
    this.setState({
      remote : {
        peers : _.uniq([peer].concat(this.state.remote.peers || []), (peer) => {
          return peer.id;
        })
      }
    });
  }

  videoRemoved(video, peer) {
    this.setState({
      remote : {
        peers : _.filter(this.state.remote.peers, (p) => {
          return p.id !== peer.id;
        })
      }
    });
  }

  render() {
    let remoteVideo = [];
    _.each(this.state.remote.peers, (peer) => {
      remoteVideo.push(<video key={peer.id} autoPlay src={peer.videoEl.src} />);
    });

    return (
      <div className="video-page">
        <div className="video-page-local">
          <video autoPlay ref="videoLocal"/>
        </div>
        <div className="video-page-remote">
          {remoteVideo}
        </div>
      </div>
    );
  }
}
