import React from 'react';
import SimpleWebRTC from 'simplewebrtc';
import '!style!css!less!./video_page.less';
import SimpleSignalConnection from '../../common/simple_signal_connection';


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
    if (!this.state.webrtc) {
      let local = React.findDOMNode(this.refs.videoLocal);
      let remote = React.findDOMNode(this.refs.videoRemote);
      let connection = new SimpleSignalConnection();

      let webrtc = new SimpleWebRTC({
        peerConnectionConfig : {
          iceServers : [{"url": "stun:global.stun.twilio.com:3478?transport=udp"}, {"url": "turn:global.turn.twilio.com:3478?transport=udp", "username": "292264de8ad148883d7f8ed12f91cecaa02565d0602055eb91d9283cf243a561", "credential": "ffpnAyooyKpuTsasyHvdHT7A8Sy7ZnvfX3VT8wxyGYw="}]
        },
        localVideoEl : local,
        remoteVideoEl : remote,
        autoRequestMedia : true
      });

      webrtc.on('readyToCall', function() {
        console.log('ready');
        console.log(webrtc.webrtc.config.peerConnectionConfig.iceServers);
        webrtc.joinRoom('3c60446b6ad0cf9e144014c3d5cb7b53');
      });

      webrtc.on('videoAdded', this.videoAdded.bind(this));
      webrtc.on('stunservers', (args) => {
        console.log(args);
        webrtc.webrtc.config.peerConnectionConfig.iceServers = [{"url": "stun:global.stun.twilio.com:3478?transport=udp"}, {"url": "turn:global.turn.twilio.com:3478?transport=udp", "username": "292264de8ad148883d7f8ed12f91cecaa02565d0602055eb91d9283cf243a561", "credential": "ffpnAyooyKpuTsasyHvdHT7A8Sy7ZnvfX3VT8wxyGYw="}];
      });

      webrtc.webrtc.on('iceFailed', () => {
        console.log(arguments);
      });
      webrtc.on('createdPeer', (peer) => {
        console.log(peer);
      });
      connection.emit('connect');

      this.setState({
        webrtc : webrtc
      });
    }
  }

  videoAdded(video, peer) {
    this.setState({
      remote : {
        peer : peer
      }
    });
  }

  render() {
    let remoteVideo = (this.state.remote.peer ?
        <video autoPlay src={this.state.remote.peer.videoEl.src} /> : '');
    return (
      <div className="video-page">
        <div className="video-page-local" ref="videoLocal">
        </div>
        <div className="video-page-remote" ref="videoRemote">
          {remoteVideo}
        </div>
      </div>
    );
  }
}
