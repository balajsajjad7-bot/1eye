"use strict";var Mp4Muxer=(()=>{var e=Object.defineProperty,t=Object.getOwnPropertyDescriptor,i=Object.getOwnPropertyNames,s=Object.prototype.hasOwnProperty,a=(e,t,i)=>{if(!t.has(e))throw TypeError("Cannot "+i)},r=(e,t,i)=>(a(e,t,"read from private field"),i?i.call(e):t.get(e)),n=(e,t,i)=>{if(t.has(e))throw TypeError("Cannot add the same private member more than once");t instanceof WeakSet?t.add(e):t.set(e,i)},o=(e,t,i,s)=>(a(e,t,"write to private field"),s?s.call(e,i):t.set(e,i),i),h=(e,t,i)=>(a(e,t,"access private method"),i),l={};((t,i)=>{for(var s in i)e(t,s,{get:i[s],enumerable:!0})})(l,{ArrayBufferTarget:()=>Me,FileSystemWritableFileStreamTarget:()=>Oe,Muxer:()=>Rt,StreamTarget:()=>We});var d,f,u,m,p,c,w,g,b=new Uint8Array(8),y=new DataView(b.buffer),k=e=>[(e%256+256)%256],T=e=>(y.setUint16(0,e,!1),[b[0],b[1]]),C=e=>(y.setUint32(0,e,!1),[b[1],b[2],b[3]]),v=e=>(y.setUint32(0,e,!1),[b[0],b[1],b[2],b[3]]),S=e=>(y.setUint32(0,Math.floor(e/2**32),!1),y.setUint32(4,e,!1),[b[0],b[1],b[2],b[3],b[4],b[5],b[6],b[7]]),x=e=>(y.setInt16(0,256*e,!1),[b[0],b[1]]),z=e=>(y.setInt32(0,65536*e,!1),[b[0],b[1],b[2],b[3]]),E=e=>(y.setInt32(0,2**30*e,!1),[b[0],b[1],b[2],b[3]]),A=(e,t=!1)=>{let i=Array(e.length).fill(null).map((t,i)=>e.charCodeAt(i));return t&&i.push(0),i},M=e=>e&&e[e.length-1],W=e=>{let t;for(let i of e)(!t||i.presentationTimestamp>t.presentationTimestamp)&&(t=i);return t},O=(e,t,i=!0)=>{let s=e*t;return i?Math.round(s):s},B=e=>{let t=e*(Math.PI/180),i=Math.cos(t),s=Math.sin(t);return[i,s,0,-s,i,0,0,0,1]},U=B(0),D=e=>[z(e[0]),z(e[1]),E(e[2]),z(e[3]),z(e[4]),E(e[5]),z(e[6]),z(e[7]),E(e[8])],j=e=>e?"object"!=typeof e?e:Array.isArray(e)?e.map(j):Object.fromEntries(Object.entries(e).map(([e,t])=>[e,j(t)])):e,R=e=>e>=0&&e<2**32,I=(e,t,i)=>({type:e,contents:t&&new Uint8Array(t.flat(10)),children:i}),N=(e,t,i,s,a)=>I(e,[k(t),C(i),s??[]],a),V=e=>({type:"mdat",largeSize:e}),F=(e,t,i=!1)=>I("moov",null,[L(t,e),...e.map(e=>$(e,t)),i?me(e):null]),L=(e,t)=>{let i=O(Math.max(0,...t.filter(e=>e.samples.length>0).map(e=>{const t=W(e.samples);return t.presentationTimestamp+t.duration})),Bt),s=Math.max(...t.map(e=>e.id))+1,a=!R(e)||!R(i),r=a?S:v;return N("mvhd",+a,0,[r(e),r(e),v(Bt),r(i),z(1),x(1),Array(10).fill(0),D(U),Array(24).fill(0),v(s)])},$=(e,t)=>I("trak",null,[P(e,t),H(e,t)]),P=(e,t)=>{let i,s=W(e.samples),a=O(s?s.presentationTimestamp+s.duration:0,Bt),r=!R(t)||!R(a),n=r?S:v;return i="video"===e.info.type?"number"==typeof e.info.rotation?B(e.info.rotation):e.info.rotation:U,N("tkhd",+r,3,[n(t),n(t),v(e.id),v(0),n(a),Array(8).fill(0),T(0),T(0),x("audio"===e.info.type?1:0),T(0),D(i),z("video"===e.info.type?e.info.width:0),z("video"===e.info.type?e.info.height:0)])},H=(e,t)=>I("mdia",null,[_(e,t),q("video"===e.info.type?"vide":"soun"),G(e)]),_=(e,t)=>{let i=W(e.samples),s=O(i?i.presentationTimestamp+i.duration:0,e.timescale),a=!R(t)||!R(s),r=a?S:v;return N("mdhd",+a,0,[r(t),r(t),v(e.timescale),r(s),T(21956),T(0)])},q=e=>N("hdlr",0,0,[A("mhlr"),A(e),v(0),v(0),v(0),A("mp4-muxer-hdlr",!0)]),G=e=>I("minf",null,["video"===e.info.type?J():K(),Q(),Z(e)]),J=()=>N("vmhd",0,1,[T(0),T(0),T(0),T(0)]),K=()=>N("smhd",0,0,[T(0),T(0)]),Q=()=>I("dinf",null,[X()]),X=()=>N("dref",0,0,[v(1)],[Y()]),Y=()=>N("url ",0,1),Z=e=>{const t=e.compositionTimeOffsetTable.length>1||e.compositionTimeOffsetTable.some(e=>0!==e.sampleCompositionTimeOffset);return I("stbl",null,[ee(e),oe(e),he(e),le(e),de(e),fe(e),t?ue(e):null])},ee=e=>N("stsd",0,0,[v(1)],["video"===e.info.type?te(Se[e.info.codec],e):ne(ze[e.info.codec],e)]),te=(e,t)=>{return I(e,[Array(6).fill(0),T(1),T(0),T(0),Array(12).fill(0),T(t.info.width),T(t.info.height),v(4718592),v(4718592),v(0),T(1),Array(32).fill(0),T(24),(i=65535,y.setInt16(0,i,!1),[b[0],b[1]])],[xe[t.info.codec](t),t.info.decoderConfig.colorSpace?re(t):null]);var i},ie={bt709:1,bt470bg:5,smpte170m:6},se={bt709:1,smpte170m:6,"iec61966-2-1":13},ae={rgb:0,bt709:1,bt470bg:5,smpte170m:6},re=e=>I("colr",[A("nclx"),T(ie[e.info.decoderConfig.colorSpace.primaries]),T(se[e.info.decoderConfig.colorSpace.transfer]),T(ae[e.info.decoderConfig.colorSpace.matrix]),k((e.info.decoderConfig.colorSpace.fullRange?1:0)<<7)]),ne=(e,t)=>I(e,[Array(6).fill(0),T(1),T(0),T(0),v(0),T(t.info.numberOfChannels),T(16),T(0),T(0),z(t.info.sampleRate)],[Ee[t.info.codec](t)]),oe=e=>N("stts",0,0,[v(e.timeToSampleTable.length),e.timeToSampleTable.map(e=>[v(e.sampleCount),v(e.sampleDelta)])]),he=e=>{if(e.samples.every(e=>"key"===e.type))return null;let t=[...e.samples.entries()].filter(([,e])=>"key"===e.type);return N("stss",0,0,[v(t.length),t.map(([e])=>v(e+1))])},le=e=>N("stsc",0,0,[v(e.compactlyCodedChunkTable.length),e.compactlyCodedChunkTable.map(e=>[v(e.firstChunk),v(e.samplesPerChunk),v(1)])]),de=e=>N("stsz",0,0,[v(0),v(e.samples.length),e.samples.map(e=>v(e.size))]),fe=e=>e.finalizedChunks.length>0&&M(e.finalizedChunks).offset>=2**32?N("co64",0,0,[v(e.finalizedChunks.length),e.finalizedChunks.map(e=>S(e.offset))]):N("stco",0,0,[v(e.finalizedChunks.length),e.finalizedChunks.map(e=>v(e.offset))]),ue=e=>N("ctts",0,0,[v(e.compositionTimeOffsetTable.length),e.compositionTimeOffsetTable.map(e=>[v(e.sampleCount),v(e.sampleCompositionTimeOffset)])]),me=e=>I("mvex",null,e.map(pe)),pe=e=>N("trex",0,0,[v(e.id),v(1),v(0),v(0),v(0)]),ce=(e,t)=>I("moof",null,[we(e),...t.map(be)]),we=e=>N("mfhd",0,0,[v(e)]),ge=e=>{let t=0,i=0,s="delta"===e.type;return i|=+s,t|=s?1:2,t<<24|i<<16},be=e=>I("traf",null,[ye(e),ke(e),Te(e)]),ye=e=>{let t=0;t|=8,t|=16,t|=32,t|=131072;let i=e.currentChunk.samples[1]??e.currentChunk.samples[0],s={duration:i.timescaleUnitsToNextSample,size:i.size,flags:ge(i)};return N("tfhd",0,131128,[v(e.id),v(s.duration),v(s.size),v(s.flags)])},ke=e=>N("tfdt",1,0,[S(O(e.currentChunk.startTimestamp,e.timescale))]),Te=e=>{let t=e.currentChunk.samples.map(e=>e.timescaleUnitsToNextSample),i=e.currentChunk.samples.map(e=>e.size),s=e.currentChunk.samples.map(ge),a=e.currentChunk.samples.map(t=>O(t.presentationTimestamp-t.decodeTimestamp,e.timescale)),r=new Set(t),n=new Set(i),o=new Set(s),h=new Set(a),l=2===o.size&&s[0]!==s[1],d=r.size>1,f=n.size>1,u=!l&&o.size>1,m=h.size>1||[...h].some(e=>0!==e),p=0;return p|=1,p|=4*+l,p|=256*+d,p|=512*+f,p|=1024*+u,p|=2048*+m,N("trun",1,p,[v(e.currentChunk.samples.length),v(e.currentChunk.offset-e.currentChunk.moofOffset||0),l?v(s[0]):[],e.currentChunk.samples.map((e,r)=>{return[d?v(t[r]):[],f?v(i[r]):[],u?v(s[r]):[],m?(n=a[r],y.setInt32(0,n,!1),[b[0],b[1],b[2],b[3]]):[]];var n})])},Ce=(e,t)=>N("tfra",1,0,[v(e.id),v(63),v(e.finalizedChunks.length),e.finalizedChunks.map(i=>[S(O(i.startTimestamp,e.timescale)),S(i.moofOffset),v(t+1),v(1),v(1)])]),ve=()=>N("mfro",0,0,[v(0)]),Se={avc:"avc1",hevc:"hvc1",vp9:"vp09",av1:"av01"},xe={avc:e=>e.info.decoderConfig&&I("avcC",[...new Uint8Array(e.info.decoderConfig.description)]),hevc:e=>e.info.decoderConfig&&I("hvcC",[...new Uint8Array(e.info.decoderConfig.description)]),vp9:e=>{if(!e.info.decoderConfig)return null;let t=e.info.decoderConfig;if(!t.colorSpace)throw new Error("'colorSpace' is required in the decoder config for VP9.");let i=t.codec.split("."),s=Number(i[1]),a=Number(i[2]),r=0+(Number(i[3])<<4)+Number(t.colorSpace.fullRange);return N("vpcC",1,0,[k(s),k(a),k(r),k(2),k(2),k(2),T(0)])},av1:()=>I("av1C",[129,0,0,0])},ze={aac:"mp4a",opus:"Opus"},Ee={aac:e=>{let t=new Uint8Array(e.info.decoderConfig.description);return N("esds",0,0,[v(58753152),k(32+t.byteLength),T(1),k(0),v(75530368),k(18+t.byteLength),k(64),k(21),C(0),v(130071),v(130071),v(92307584),k(t.byteLength),...t,v(109084800),k(1),k(2)])},opus:e=>{let t=3840,i=0;const s=e.info.decoderConfig?.description;if(s){if(s.byteLength<18)throw new TypeError("Invalid decoder description provided for Opus; must be at least 18 bytes long.");const e=ArrayBuffer.isView(s)?new DataView(s.buffer,s.byteOffset,s.byteLength):new DataView(s);t=e.getUint16(10,!0),i=e.getInt16(14,!0)}return I("dOps",[k(0),k(e.info.numberOfChannels),T(t),v(e.info.sampleRate),x(i),k(0)])}},Ae=(Symbol("isTarget"),class{}),Me=class extends Ae{constructor(){super(...arguments),this.buffer=null}},We=class extends Ae{constructor(e){if(super(),this.options=e,"object"!=typeof e)throw new TypeError("StreamTarget requires an options object to be passed to its constructor.");if(e.onData){if("function"!=typeof e.onData)throw new TypeError("options.onData, when provided, must be a function.");if(e.onData.length<2)throw new TypeError("options.onData, when provided, must be a function that takes in at least two arguments (data and position). Ignoring the position argument, which specifies the byte offset at which the data is to be written, can lead to broken outputs.")}if(void 0!==e.chunked&&"boolean"!=typeof e.chunked)throw new TypeError("options.chunked, when provided, must be a boolean.");if(void 0!==e.chunkSize&&(!Number.isInteger(e.chunkSize)||e.chunkSize<1024))throw new TypeError("options.chunkSize, when provided, must be an integer and not smaller than 1024.")}},Oe=class extends Ae{constructor(e,t){if(super(),this.stream=e,this.options=t,!(e instanceof FileSystemWritableFileStream))throw new TypeError("FileSystemWritableFileStreamTarget requires a FileSystemWritableFileStream instance.");if(void 0!==t&&"object"!=typeof t)throw new TypeError("FileSystemWritableFileStreamTarget's options, when provided, must be an object.");if(t&&void 0!==t.chunkSize&&(!Number.isInteger(t.chunkSize)||t.chunkSize<=0))throw new TypeError("options.chunkSize, when provided, must be a positive integer")}},Be=class{constructor(){this.pos=0,n(this,d,new Uint8Array(8)),n(this,f,new DataView(r(this,d).buffer)),this.offsets=new WeakMap}seek(e){this.pos=e}writeU32(e){r(this,f).setUint32(0,e,!1),this.write(r(this,d).subarray(0,4))}writeU64(e){r(this,f).setUint32(0,Math.floor(e/2**32),!1),r(this,f).setUint32(4,e,!1),this.write(r(this,d).subarray(0,8))}writeAscii(e){for(let t=0;t<e.length;t++)r(this,f).setUint8(t%8,e.charCodeAt(t)),t%8==7&&this.write(r(this,d));e.length%8!=0&&this.write(r(this,d).subarray(0,e.length%8))}writeBox(e){if(this.offsets.set(e,this.pos),e.contents&&!e.children)this.writeBoxHeader(e,e.size??e.contents.byteLength+8),this.write(e.contents);else{let t=this.pos;if(this.writeBoxHeader(e,0),e.contents&&this.write(e.contents),e.children)for(let t of e.children)t&&this.writeBox(t);let i=this.pos,s=e.size??i-t;this.seek(t),this.writeBoxHeader(e,s),this.seek(i)}}writeBoxHeader(e,t){this.writeU32(e.largeSize?1:t),this.writeAscii(e.type),e.largeSize&&this.writeU64(t)}measureBoxHeader(e){return 8+(e.largeSize?8:0)}patchBox(e){let t=this.pos;this.seek(this.offsets.get(e)),this.writeBox(e),this.seek(t)}measureBox(e){if(e.contents&&!e.children){return this.measureBoxHeader(e)+e.contents.byteLength}{let t=this.measureBoxHeader(e);if(e.contents&&(t+=e.contents.byteLength),e.children)for(let i of e.children)i&&(t+=this.measureBox(i));return t}}};d=new WeakMap,f=new WeakMap;var Ue=class extends Be{constructor(e){super(),n(this,w),n(this,u,void 0),n(this,m,new ArrayBuffer(65536)),n(this,p,new Uint8Array(r(this,m))),n(this,c,0),o(this,u,e)}write(e){h(this,w,g).call(this,this.pos+e.byteLength),r(this,p).set(e,this.pos),this.pos+=e.byteLength,o(this,c,Math.max(r(this,c),this.pos))}finalize(){h(this,w,g).call(this,this.pos),r(this,u).buffer=r(this,m).slice(0,Math.max(r(this,c),this.pos))}};u=new WeakMap,m=new WeakMap,p=new WeakMap,c=new WeakMap,w=new WeakSet,g=function(e){let t=r(this,m).byteLength;for(;t<e;)t*=2;if(t===r(this,m).byteLength)return;let i=new ArrayBuffer(t),s=new Uint8Array(i);s.set(r(this,p),0),o(this,m,i),o(this,p,s)};var De,je,Re,Ie,Ne,Ve,Fe,Le,$e,Pe,He,_e,qe,Ge=class extends Be{constructor(e){super(),n(this,Ve),n(this,Le),n(this,Pe),n(this,_e),n(this,De,void 0),n(this,je,[]),n(this,Re,void 0),n(this,Ie,void 0),n(this,Ne,[]),o(this,De,e),o(this,Re,e.options?.chunked??!1),o(this,Ie,e.options?.chunkSize??16777216)}write(e){r(this,je).push({data:e.slice(),start:this.pos}),this.pos+=e.byteLength}flush(){if(0===r(this,je).length)return;let e=[],t=[...r(this,je)].sort((e,t)=>e.start-t.start);e.push({start:t[0].start,size:t[0].data.byteLength});for(let i=1;i<t.length;i++){let s=e[e.length-1],a=t[i];a.start<=s.start+s.size?s.size=Math.max(s.size,a.start+a.data.byteLength-s.start):e.push({start:a.start,size:a.data.byteLength})}for(let t of e){t.data=new Uint8Array(t.size);for(let e of r(this,je))t.start<=e.start&&e.start<t.start+t.size&&t.data.set(e.data,e.start-t.start);r(this,Re)?(h(this,Ve,Fe).call(this,t.data,t.start),h(this,_e,qe).call(this)):r(this,De).options.onData?.(t.data,t.start)}r(this,je).length=0}finalize(){r(this,Re)&&h(this,_e,qe).call(this,!0)}};De=new WeakMap,je=new WeakMap,Re=new WeakMap,Ie=new WeakMap,Ne=new WeakMap,Ve=new WeakSet,Fe=function(e,t){let i=r(this,Ne).findIndex(e=>e.start<=t&&t<e.start+r(this,Ie));-1===i&&(i=h(this,Pe,He).call(this,t));let s=r(this,Ne)[i],a=t-s.start,n=e.subarray(0,Math.min(r(this,Ie)-a,e.byteLength));s.data.set(n,a);let o={start:a,end:a+n.byteLength};if(h(this,Le,$e).call(this,s,o),0===s.written[0].start&&s.written[0].end===r(this,Ie)&&(s.shouldFlush=!0),r(this,Ne).length>2){for(let e=0;e<r(this,Ne).length-1;e++)r(this,Ne)[e].shouldFlush=!0;h(this,_e,qe).call(this)}n.byteLength<e.byteLength&&h(this,Ve,Fe).call(this,e.subarray(n.byteLength),t+n.byteLength)},Le=new WeakSet,$e=function(e,t){let i=0,s=e.written.length-1,a=-1;for(;i<=s;){let r=Math.floor(i+(s-i+1)/2);e.written[r].start<=t.start?(i=r+1,a=r):s=r-1}for(e.written.splice(a+1,0,t),(-1===a||e.written[a].end<t.start)&&a++;a<e.written.length-1&&e.written[a].end>=e.written[a+1].start;)e.written[a].end=Math.max(e.written[a].end,e.written[a+1].end),e.written.splice(a+1,1)},Pe=new WeakSet,He=function(e){let t={start:Math.floor(e/r(this,Ie))*r(this,Ie),data:new Uint8Array(r(this,Ie)),written:[],shouldFlush:!1};return r(this,Ne).push(t),r(this,Ne).sort((e,t)=>e.start-t.start),r(this,Ne).indexOf(t)},_e=new WeakSet,qe=function(e=!1){for(let t=0;t<r(this,Ne).length;t++){let i=r(this,Ne)[t];if(i.shouldFlush||e){for(let e of i.written)r(this,De).options.onData?.(i.data.subarray(e.start,e.end),i.start+e.start);r(this,Ne).splice(t--,1)}}};var Je,Ke,Qe,Xe,Ye,Ze,et,tt,it,st,at,rt,nt,ot,ht,lt,dt,ft,ut,mt,pt,ct,wt,gt,bt,yt,kt,Tt,Ct,vt,St,xt,zt,Et,At,Mt,Wt,Ot=class extends Ge{constructor(e){super(new We({onData:(t,i)=>e.stream.write({type:"write",data:t,position:i}),chunked:!0,chunkSize:e.options?.chunkSize}))}},Bt=1e3,Ut=["avc","hevc","vp9","av1"],Dt=["aac","opus"],jt=["strict","offset","cross-track-offset"],Rt=class{constructor(e){if(n(this,nt),n(this,ht),n(this,dt),n(this,ut),n(this,pt),n(this,wt),n(this,bt),n(this,kt),n(this,Ct),n(this,St),n(this,zt),n(this,At),n(this,Je,void 0),n(this,Ke,void 0),n(this,Qe,void 0),n(this,Xe,void 0),n(this,Ye,null),n(this,Ze,null),n(this,et,Math.floor(Date.now()/1e3)+2082844800),n(this,tt,[]),n(this,it,1),n(this,st,[]),n(this,at,[]),n(this,rt,!1),h(this,nt,ot).call(this,e),e.video=j(e.video),e.audio=j(e.audio),e.fastStart=j(e.fastStart),this.target=e.target,o(this,Je,{firstTimestampBehavior:"strict",...e}),e.target instanceof Me)o(this,Ke,new Ue(e.target));else if(e.target instanceof We)o(this,Ke,new Ge(e.target));else{if(!(e.target instanceof Oe))throw new Error(`Invalid target: ${e.target}`);o(this,Ke,new Ot(e.target))}h(this,ut,mt).call(this),h(this,ht,lt).call(this)}addVideoChunk(e,t,i,s){if(!(e instanceof EncodedVideoChunk))throw new TypeError("addVideoChunk's first argument (sample) must be of type EncodedVideoChunk.");if(t&&"object"!=typeof t)throw new TypeError("addVideoChunk's second argument (meta), when provided, must be an object.");if(void 0!==i&&(!Number.isFinite(i)||i<0))throw new TypeError("addVideoChunk's third argument (timestamp), when provided, must be a non-negative real number.");if(void 0!==s&&!Number.isFinite(s))throw new TypeError("addVideoChunk's fourth argument (compositionTimeOffset), when provided, must be a real number.");let a=new Uint8Array(e.byteLength);e.copyTo(a),this.addVideoChunkRaw(a,e.type,i??e.timestamp,e.duration,t,s)}addVideoChunkRaw(e,t,i,s,a,n){if(!(e instanceof Uint8Array))throw new TypeError("addVideoChunkRaw's first argument (data) must be an instance of Uint8Array.");if("key"!==t&&"delta"!==t)throw new TypeError("addVideoChunkRaw's second argument (type) must be either 'key' or 'delta'.");if(!Number.isFinite(i)||i<0)throw new TypeError("addVideoChunkRaw's third argument (timestamp) must be a non-negative real number.");if(!Number.isFinite(s)||s<0)throw new TypeError("addVideoChunkRaw's fourth argument (duration) must be a non-negative real number.");if(a&&"object"!=typeof a)throw new TypeError("addVideoChunkRaw's fifth argument (meta), when provided, must be an object.");if(void 0!==n&&!Number.isFinite(n))throw new TypeError("addVideoChunkRaw's sixth argument (compositionTimeOffset), when provided, must be a real number.");if(h(this,At,Mt).call(this),!r(this,Je).video)throw new Error("No video track declared.");if("object"==typeof r(this,Je).fastStart&&r(this,Ye).samples.length===r(this,Je).fastStart.expectedVideoChunks)throw new Error(`Cannot add more video chunks than specified in 'fastStart' (${r(this,Je).fastStart.expectedVideoChunks}).`);let o=h(this,wt,gt).call(this,r(this,Ye),e,t,i,s,a,n);if("fragmented"===r(this,Je).fastStart&&r(this,Ze)){for(;r(this,at).length>0&&r(this,at)[0].decodeTimestamp<=o.decodeTimestamp;){let e=r(this,at).shift();h(this,bt,yt).call(this,r(this,Ze),e)}o.decodeTimestamp<=r(this,Ze).lastDecodeTimestamp?h(this,bt,yt).call(this,r(this,Ye),o):r(this,st).push(o)}else h(this,bt,yt).call(this,r(this,Ye),o)}addAudioChunk(e,t,i){if(!(e instanceof EncodedAudioChunk))throw new TypeError("addAudioChunk's first argument (sample) must be of type EncodedAudioChunk.");if(t&&"object"!=typeof t)throw new TypeError("addAudioChunk's second argument (meta), when provided, must be an object.");if(void 0!==i&&(!Number.isFinite(i)||i<0))throw new TypeError("addAudioChunk's third argument (timestamp), when provided, must be a non-negative real number.");let s=new Uint8Array(e.byteLength);e.copyTo(s),this.addAudioChunkRaw(s,e.type,i??e.timestamp,e.duration,t)}addAudioChunkRaw(e,t,i,s,a){if(!(e instanceof Uint8Array))throw new TypeError("addAudioChunkRaw's first argument (data) must be an instance of Uint8Array.");if("key"!==t&&"delta"!==t)throw new TypeError("addAudioChunkRaw's second argument (type) must be either 'key' or 'delta'.");if(!Number.isFinite(i)||i<0)throw new TypeError("addAudioChunkRaw's third argument (timestamp) must be a non-negative real number.");if(!Number.isFinite(s)||s<0)throw new TypeError("addAudioChunkRaw's fourth argument (duration) must be a non-negative real number.");if(a&&"object"!=typeof a)throw new TypeError("addAudioChunkRaw's fifth argument (meta), when provided, must be an object.");if(h(this,At,Mt).call(this),!r(this,Je).audio)throw new Error("No audio track declared.");if("object"==typeof r(this,Je).fastStart&&r(this,Ze).samples.length===r(this,Je).fastStart.expectedAudioChunks)throw new Error(`Cannot add more audio chunks than specified in 'fastStart' (${r(this,Je).fastStart.expectedAudioChunks}).`);let n=h(this,wt,gt).call(this,r(this,Ze),e,t,i,s,a);if("fragmented"===r(this,Je).fastStart&&r(this,Ye)){for(;r(this,st).length>0&&r(this,st)[0].decodeTimestamp<=n.decodeTimestamp;){let e=r(this,st).shift();h(this,bt,yt).call(this,r(this,Ye),e)}n.decodeTimestamp<=r(this,Ye).lastDecodeTimestamp?h(this,bt,yt).call(this,r(this,Ze),n):r(this,at).push(n)}else h(this,bt,yt).call(this,r(this,Ze),n)}finalize(){if(r(this,rt))throw new Error("Cannot finalize a muxer more than once.");if("fragmented"===r(this,Je).fastStart){for(let e of r(this,st))h(this,bt,yt).call(this,r(this,Ye),e);for(let e of r(this,at))h(this,bt,yt).call(this,r(this,Ze),e);h(this,St,xt).call(this,!1)}else r(this,Ye)&&h(this,Ct,vt).call(this,r(this,Ye)),r(this,Ze)&&h(this,Ct,vt).call(this,r(this,Ze));let e=[r(this,Ye),r(this,Ze)].filter(Boolean);if("in-memory"===r(this,Je).fastStart){let t;for(let i=0;i<2;i++){let i=F(e,r(this,et)),s=r(this,Ke).measureBox(i);t=r(this,Ke).measureBox(r(this,Xe));let a=r(this,Ke).pos+s+t;for(let e of r(this,tt)){e.offset=a;for(let{data:i}of e.samples)a+=i.byteLength,t+=i.byteLength}if(a<2**32)break;t>=2**32&&(r(this,Xe).largeSize=!0)}let i=F(e,r(this,et));r(this,Ke).writeBox(i),r(this,Xe).size=t,r(this,Ke).writeBox(r(this,Xe));for(let e of r(this,tt))for(let t of e.samples)r(this,Ke).write(t.data),t.data=null}else if("fragmented"===r(this,Je).fastStart){let t=r(this,Ke).pos,i=(e=>I("mfra",null,[...e.map(Ce),ve()]))(e);r(this,Ke).writeBox(i);let s=r(this,Ke).pos-t;r(this,Ke).seek(r(this,Ke).pos-4),r(this,Ke).writeU32(s)}else{let t=r(this,Ke).offsets.get(r(this,Xe)),i=r(this,Ke).pos-t;r(this,Xe).size=i,r(this,Xe).largeSize=i>=2**32,r(this,Ke).patchBox(r(this,Xe));let s=F(e,r(this,et));if("object"==typeof r(this,Je).fastStart){r(this,Ke).seek(r(this,Qe)),r(this,Ke).writeBox(s);let e=t-r(this,Ke).pos;r(this,Ke).writeBox({type:"free",size:e})}else r(this,Ke).writeBox(s)}h(this,zt,Et).call(this),r(this,Ke).finalize(),o(this,rt,!0)}};return Je=new WeakMap,Ke=new WeakMap,Qe=new WeakMap,Xe=new WeakMap,Ye=new WeakMap,Ze=new WeakMap,et=new WeakMap,tt=new WeakMap,it=new WeakMap,st=new WeakMap,at=new WeakMap,rt=new WeakMap,nt=new WeakSet,ot=function(e){if("object"!=typeof e)throw new TypeError("The muxer requires an options object to be passed to its constructor.");if(!(e.target instanceof Ae))throw new TypeError("The target must be provided and an instance of Target.");if(e.video){if(!Ut.includes(e.video.codec))throw new TypeError(`Unsupported video codec: ${e.video.codec}`);if(!Number.isInteger(e.video.width)||e.video.width<=0)throw new TypeError(`Invalid video width: ${e.video.width}. Must be a positive integer.`);if(!Number.isInteger(e.video.height)||e.video.height<=0)throw new TypeError(`Invalid video height: ${e.video.height}. Must be a positive integer.`);const t=e.video.rotation;if("number"==typeof t&&![0,90,180,270].includes(t))throw new TypeError(`Invalid video rotation: ${t}. Has to be 0, 90, 180 or 270.`);if(Array.isArray(t)&&(9!==t.length||t.some(e=>"number"!=typeof e)))throw new TypeError(`Invalid video transformation matrix: ${t.join()}`);if(void 0!==e.video.frameRate&&(!Number.isInteger(e.video.frameRate)||e.video.frameRate<=0))throw new TypeError(`Invalid video frame rate: ${e.video.frameRate}. Must be a positive integer.`)}if(e.audio){if(!Dt.includes(e.audio.codec))throw new TypeError(`Unsupported audio codec: ${e.audio.codec}`);if(!Number.isInteger(e.audio.numberOfChannels)||e.audio.numberOfChannels<=0)throw new TypeError(`Invalid number of audio channels: ${e.audio.numberOfChannels}. Must be a positive integer.`);if(!Number.isInteger(e.audio.sampleRate)||e.audio.sampleRate<=0)throw new TypeError(`Invalid audio sample rate: ${e.audio.sampleRate}. Must be a positive integer.`)}if(e.firstTimestampBehavior&&!jt.includes(e.firstTimestampBehavior))throw new TypeError(`Invalid first timestamp behavior: ${e.firstTimestampBehavior}`);if("object"==typeof e.fastStart){if(e.video){if(void 0===e.fastStart.expectedVideoChunks)throw new TypeError("'fastStart' is an object but is missing property 'expectedVideoChunks'.");if(!Number.isInteger(e.fastStart.expectedVideoChunks)||e.fastStart.expectedVideoChunks<0)throw new TypeError("'expectedVideoChunks' must be a non-negative integer.")}if(e.audio){if(void 0===e.fastStart.expectedAudioChunks)throw new TypeError("'fastStart' is an object but is missing property 'expectedAudioChunks'.");if(!Number.isInteger(e.fastStart.expectedAudioChunks)||e.fastStart.expectedAudioChunks<0)throw new TypeError("'expectedAudioChunks' must be a non-negative integer.")}}else if(![!1,"in-memory","fragmented"].includes(e.fastStart))throw new TypeError("'fastStart' option must be false, 'in-memory', 'fragmented' or an object.");if(void 0!==e.minFragmentDuration&&(!Number.isFinite(e.minFragmentDuration)||e.minFragmentDuration<0))throw new TypeError("'minFragmentDuration' must be a non-negative number.")},ht=new WeakSet,lt=function(){var e;if(r(this,Ke).writeBox((e={holdsAvc:"avc"===r(this,Je).video?.codec,fragmented:"fragmented"===r(this,Je).fastStart}).fragmented?I("ftyp",[A("iso5"),v(512),A("iso5"),A("iso6"),A("mp41")]):I("ftyp",[A("isom"),v(512),A("isom"),e.holdsAvc?A("avc1"):[],A("mp41")])),o(this,Qe,r(this,Ke).pos),"in-memory"===r(this,Je).fastStart)o(this,Xe,V(!1));else if("fragmented"===r(this,Je).fastStart);else{if("object"==typeof r(this,Je).fastStart){let e=h(this,dt,ft).call(this);r(this,Ke).seek(r(this,Ke).pos+e)}o(this,Xe,V(!0)),r(this,Ke).writeBox(r(this,Xe))}h(this,zt,Et).call(this)},dt=new WeakSet,ft=function(){if("object"!=typeof r(this,Je).fastStart)return;let e=0,t=[r(this,Je).fastStart.expectedVideoChunks,r(this,Je).fastStart.expectedAudioChunks];for(let i of t)i&&(e+=8*Math.ceil(2/3*i),e+=4*i,e+=12*Math.ceil(2/3*i),e+=4*i,e+=8*i);return e+=4096,e},ut=new WeakSet,mt=function(){if(r(this,Je).video&&o(this,Ye,{id:1,info:{type:"video",codec:r(this,Je).video.codec,width:r(this,Je).video.width,height:r(this,Je).video.height,rotation:r(this,Je).video.rotation??0,decoderConfig:null},timescale:r(this,Je).video.frameRate??57600,samples:[],finalizedChunks:[],currentChunk:null,firstDecodeTimestamp:void 0,lastDecodeTimestamp:-1,timeToSampleTable:[],compositionTimeOffsetTable:[],lastTimescaleUnits:null,lastSample:null,compactlyCodedChunkTable:[]}),r(this,Je).audio&&(o(this,Ze,{id:r(this,Je).video?2:1,info:{type:"audio",codec:r(this,Je).audio.codec,numberOfChannels:r(this,Je).audio.numberOfChannels,sampleRate:r(this,Je).audio.sampleRate,decoderConfig:null},timescale:r(this,Je).audio.sampleRate,samples:[],finalizedChunks:[],currentChunk:null,firstDecodeTimestamp:void 0,lastDecodeTimestamp:-1,timeToSampleTable:[],compositionTimeOffsetTable:[],lastTimescaleUnits:null,lastSample:null,compactlyCodedChunkTable:[]}),"aac"===r(this,Je).audio.codec)){let e=h(this,pt,ct).call(this,2,r(this,Je).audio.sampleRate,r(this,Je).audio.numberOfChannels);r(this,Ze).info.decoderConfig={codec:r(this,Je).audio.codec,description:e,numberOfChannels:r(this,Je).audio.numberOfChannels,sampleRate:r(this,Je).audio.sampleRate}}},pt=new WeakSet,ct=function(e,t,i){let s=[96e3,88200,64e3,48e3,44100,32e3,24e3,22050,16e3,12e3,11025,8e3,7350].indexOf(t),a=i,r="";r+=e.toString(2).padStart(5,"0"),r+=s.toString(2).padStart(4,"0"),15===s&&(r+=t.toString(2).padStart(24,"0")),r+=a.toString(2).padStart(4,"0");let n=8*Math.ceil(r.length/8);r=r.padEnd(n,"0");let o=new Uint8Array(r.length/8);for(let e=0;e<r.length;e+=8)o[e/8]=parseInt(r.slice(e,e+8),2);return o},wt=new WeakSet,gt=function(e,t,i,s,a,r,n){let o=s/1e6,l=(s-(n??0))/1e6,d=a/1e6,f=h(this,kt,Tt).call(this,o,l,e);return o=f.presentationTimestamp,l=f.decodeTimestamp,r?.decoderConfig&&(null===e.info.decoderConfig?e.info.decoderConfig=r.decoderConfig:Object.assign(e.info.decoderConfig,r.decoderConfig)),{presentationTimestamp:o,decodeTimestamp:l,duration:d,data:t,size:t.byteLength,type:i,timescaleUnitsToNextSample:O(d,e.timescale)}},bt=new WeakSet,yt=function(e,t){"fragmented"!==r(this,Je).fastStart&&e.samples.push(t);const i=O(t.presentationTimestamp-t.decodeTimestamp,e.timescale);if(null!==e.lastTimescaleUnits){let s=O(t.decodeTimestamp,e.timescale,!1),a=Math.round(s-e.lastTimescaleUnits);if(e.lastTimescaleUnits+=a,e.lastSample.timescaleUnitsToNextSample=a,"fragmented"!==r(this,Je).fastStart){let t=M(e.timeToSampleTable);1===t.sampleCount?(t.sampleDelta=a,t.sampleCount++):t.sampleDelta===a?t.sampleCount++:(t.sampleCount--,e.timeToSampleTable.push({sampleCount:2,sampleDelta:a}));const s=M(e.compositionTimeOffsetTable);s.sampleCompositionTimeOffset===i?s.sampleCount++:e.compositionTimeOffsetTable.push({sampleCount:1,sampleCompositionTimeOffset:i})}}else e.lastTimescaleUnits=0,"fragmented"!==r(this,Je).fastStart&&(e.timeToSampleTable.push({sampleCount:1,sampleDelta:O(t.duration,e.timescale)}),e.compositionTimeOffsetTable.push({sampleCount:1,sampleCompositionTimeOffset:i}));e.lastSample=t;let s=!1;if(e.currentChunk){let i=t.presentationTimestamp-e.currentChunk.startTimestamp;if("fragmented"===r(this,Je).fastStart){let a=r(this,Ye)??r(this,Ze);const n=r(this,Je).minFragmentDuration??1;e===a&&"key"===t.type&&i>=n&&(s=!0,h(this,St,xt).call(this))}else s=i>=.5}else s=!0;s&&(e.currentChunk&&h(this,Ct,vt).call(this,e),e.currentChunk={startTimestamp:t.presentationTimestamp,samples:[]}),e.currentChunk.samples.push(t)},kt=new WeakSet,Tt=function(e,t,i){const s="strict"===r(this,Je).firstTimestampBehavior,a=-1===i.lastDecodeTimestamp;if(s&&a&&0!==t)throw new Error(`The first chunk for your media track must have a timestamp of 0 (received DTS=${t}).Non-zero first timestamps are often caused by directly piping frames or audio data from a MediaStreamTrack into the encoder. Their timestamps are typically relative to the age of thedocument, which is probably what you want.\n\nIf you want to offset all timestamps of a track such that the first one is zero, set firstTimestampBehavior: 'offset' in the options.\n`);if("offset"===r(this,Je).firstTimestampBehavior||"cross-track-offset"===r(this,Je).firstTimestampBehavior){let s;void 0===i.firstDecodeTimestamp&&(i.firstDecodeTimestamp=t),s="offset"===r(this,Je).firstTimestampBehavior?i.firstDecodeTimestamp:Math.min(r(this,Ye)?.firstDecodeTimestamp??1/0,r(this,Ze)?.firstDecodeTimestamp??1/0),t-=s,e-=s}if(t<i.lastDecodeTimestamp)throw new Error(`Timestamps must be monotonically increasing (DTS went from ${1e6*i.lastDecodeTimestamp} to ${1e6*t}).`);return i.lastDecodeTimestamp=t,{presentationTimestamp:e,decodeTimestamp:t}},Ct=new WeakSet,vt=function(e){if("fragmented"===r(this,Je).fastStart)throw new Error("Can't finalize individual chunks if 'fastStart' is set to 'fragmented'.");if(e.currentChunk)if(e.finalizedChunks.push(e.currentChunk),r(this,tt).push(e.currentChunk),0!==e.compactlyCodedChunkTable.length&&M(e.compactlyCodedChunkTable).samplesPerChunk===e.currentChunk.samples.length||e.compactlyCodedChunkTable.push({firstChunk:e.finalizedChunks.length,samplesPerChunk:e.currentChunk.samples.length}),"in-memory"!==r(this,Je).fastStart){e.currentChunk.offset=r(this,Ke).pos;for(let t of e.currentChunk.samples)r(this,Ke).write(t.data),t.data=null;h(this,zt,Et).call(this)}else e.currentChunk.offset=0},St=new WeakSet,xt=function(e=!0){if("fragmented"!==r(this,Je).fastStart)throw new Error("Can't finalize a fragment unless 'fastStart' is set to 'fragmented'.");let t=[r(this,Ye),r(this,Ze)].filter(e=>e&&e.currentChunk);if(0===t.length)return;let i=(s=this,a=it,{set _(e){o(s,a,e,n)},get _(){return r(s,a,l)}})._++;var s,a,n,l;if(1===i){let e=F(t,r(this,et),!0);r(this,Ke).writeBox(e)}let d=r(this,Ke).pos,f=ce(i,t);r(this,Ke).writeBox(f);{let e=V(!1),i=0;for(let e of t)for(let t of e.currentChunk.samples)i+=t.size;let s=r(this,Ke).measureBox(e)+i;s>=2**32&&(e.largeSize=!0,s=r(this,Ke).measureBox(e)+i),e.size=s,r(this,Ke).writeBox(e)}for(let e of t){e.currentChunk.offset=r(this,Ke).pos,e.currentChunk.moofOffset=d;for(let t of e.currentChunk.samples)r(this,Ke).write(t.data),t.data=null}let u=r(this,Ke).pos;r(this,Ke).seek(r(this,Ke).offsets.get(f));let m=ce(i,t);r(this,Ke).writeBox(m),r(this,Ke).seek(u);for(let e of t)e.finalizedChunks.push(e.currentChunk),r(this,tt).push(e.currentChunk),e.currentChunk=null;e&&h(this,zt,Et).call(this)},zt=new WeakSet,Et=function(){r(this,Ke)instanceof Ge&&r(this,Ke).flush()},At=new WeakSet,Mt=function(){if(r(this,rt))throw new Error("Cannot add new video or audio chunks after the file has been finalized.")},Wt=l,((a,r,n,o)=>{if(r&&"object"==typeof r||"function"==typeof r)for(let h of i(r))s.call(a,h)||h===n||e(a,h,{get:()=>r[h],enumerable:!(o=t(r,h))||o.enumerable});return a})(e({},"__esModule",{value:!0}),Wt)})();"object"==typeof module&&"object"==typeof module.exports&&Object.assign(module.exports,Mp4Muxer);;
/* 1EYE — "noir" eye. An original, real-time black-and-white close-up of a human eye.
   One WebGL fragment shader, no images, no footage: almond lids, wet lower rim, lashes,
   a glossy near-black iris with studio catchlights, film grain, flicker and scratches.
   It darts around like a nervous glance, blinks, and follows your cursor. */
window.Noir = (() => {
  const VS = `attribute vec2 a;void main(){gl_Position=vec4(a,0.,1.);}`;
  const FS = `precision highp float;
uniform vec2 R;uniform float T;uniform vec2 G;uniform float P;uniform float B;uniform float Z;uniform float F;
float h1(float n){return fract(sin(n)*43758.5453);}
float h3(vec3 p){p=fract(p*.1031);p+=dot(p,p.zyx+31.32);return fract((p.x+p.y)*p.z);}
float n3(vec3 x){vec3 i=floor(x),f=fract(x);f=f*f*(3.-2.*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),mix(h3(i+vec3(0,1,1)),h3(i+1.),f.x),f.y),f.z);}
float fbm(vec3 p){float v=0.,a=.5;for(int i=0;i<4;i++){v+=a*n3(p);p=p*2.03+vec3(3.1,1.7,5.3);a*=.5;}return v;}
/* lid curves: x in -1..1 across the opening */
float upper(float x,float open){float k=clamp(1.-x*x,0.,1.);return mix(-.05,.50*pow(k,.62)+.04*x,open)+.02*x;}
float lower(float x){float k=clamp(1.-x*x,0.,1.);return -.30*pow(k,.78)-.03*x-.02;}
void main(){
  vec2 uv=(gl_FragCoord.xy-.5*R)/min(R.x,R.y)*2.;
  uv/=Z;
  float t=T;
  float W=1.02;                                   /* half width of the eye opening */
  float x=uv.x/W;
  float open=1.-B;
  float yu=upper(x,open), yl=lower(x);
  float inside=smoothstep(1.,.97,abs(x))*smoothstep(yl-.012,yl+.014,uv.y)*smoothstep(yu+.014,yu-.016,uv.y);
  /* ---------- eyeball ---------- */
  vec2 c=vec2(G.x*.56,G.y*.26-.03);               /* iris centre follows the gaze */
  vec2 q=uv-c;
  q.x*=1.+abs(G.x)*.22;                           /* foreshortening as it turns */
  float ri=.47, r=length(q);
  /* sclera: soft grey ball lit from above-left, darker toward the corners and under the upper lid */
  float ball=1.-smoothstep(.2,1.25,length(uv*vec2(.85,1.25)+vec2(.08,-.05)));
  float sc=.40+.36*ball;
  sc+=.06*(fbm(vec3(uv*6.,1.))-.5)+.03*(fbm(vec3(uv*28.,3.))-.5);
  float topShadow=smoothstep(.0,.24,yu-uv.y);     /* the upper lid casts a shadow on the ball */
  sc*=mix(.28,1.,topShadow);
  sc*=mix(.75,1.,smoothstep(0.,.08,uv.y-yl));
  sc*=1.-smoothstep(.5,1.,abs(x))*.7;
  /* faint veins */
  vec3 col=vec3(sc);
  /* red veins: thin branching capillaries that crawl in from the corners toward the iris */
  vec2 vw=uv+.18*vec2(fbm(vec3(uv*3.,11.)),fbm(vec3(uv*3.,17.)))-.09;
  float v1=pow(1.-abs(fbm(vec3(vw*vec2(4.,7.),7.))*2.-1.),26.);
  float v2=pow(1.-abs(fbm(vec3(vw*vec2(9.,15.),3.))*2.-1.),46.)*.8;
  float v3=pow(1.-abs(fbm(vec3(vw*vec2(18.,26.),5.))*2.-1.),60.)*.55;
  float reach=smoothstep(.08,.9,abs(x));          /* dense in the corners, fading toward the iris */
  float vn=clamp((v1+v2*smoothstep(.3,1.,abs(x))+v3*smoothstep(.55,1.,abs(x)))*reach,0.,1.);
  vn*=.55+.45*smoothstep(.0,.1,uv.y-yl);           /* a few more along the lower lid */
  vec3 blood=vec3(.62,.07,.06)*(.55+.6*sc);
  col=mix(col,blood,min(1.,vn*1.05));
  col+=vec3(.05,-.01,-.01)*reach*.6;               /* faint pink flush in the corners */
  /* iris: almost black, with a dim radial grain and a slightly lighter limbal edge */
  float a=atan(q.y,q.x);
  float fib=fbm(vec3(cos(a)*18.,sin(a)*18.,r*9.));
  float ir=.018+.03*fib*smoothstep(.12,ri,r)+.022*exp(-pow((r-ri*.9)/.05,2.));
  float pu=smoothstep(P+.01,P-.01,r);             /* pupil, barely visible */
  ir=mix(ir,.012,pu);
  float iris=smoothstep(ri+.022,ri-.022,r);
  float ring=exp(-pow((r-ri)/.022,2.))*.08;       /* soft dark-grey halo where iris meets sclera */
  col=mix(col-ring,vec3(ir),iris);
  /* corneal bulge shading: iris a touch brighter at the bottom where it catches bounce light */
  col+=iris*.05*smoothstep(.0,-.45,q.y)*smoothstep(ri,.1,r);
  /* catchlights on the wet cornea (move with the iris) */
  vec2 l1=q-vec2(-.12,.135),l2=q-vec2(-.045,.125),l3=q-vec2(.165,.035);
  float cat=exp(-dot(l1,l1)*1500.)*1.2+exp(-dot(l2,l2)*2600.)*.9+exp(-dot(l3,l3)*1800.)*.8;
  cat+=exp(-dot(l1,l1)*120.)*.08;
  col+=cat*smoothstep(ri+.06,ri-.02,r);
  /* caruncle: the fleshy bump in the inner corner */
  vec2 cu=uv-vec2(W*.98,.02);
  float car=exp(-dot(cu*vec2(1.,1.4),cu*vec2(1.,1.4))*90.);
  col=mix(col,vec3(.46,.24,.22),car*.75);
  col*=inside;
  /* ---------- lids and skin ---------- */
  float skin=.035+.05*fbm(vec3(uv*3.,2.))+.025*(n3(vec3(uv*90.,1.))-.5);
  /* upper lid: a dark crease above, skin catching light on the fold */
  float above=uv.y-yu;
  float fold=exp(-pow((above-.16-.03*(1.-x*x))/.05,2.))*smoothstep(1.2,.3,abs(x));
  float upSkin=skin+.05*smoothstep(.04,.12,above)*smoothstep(.4,.12,above)*(1.-x*x)+.04*fold;
  upSkin*=smoothstep(1.35,.6,abs(x))*smoothstep(.9,.15,above);
  /* lower lid: a bright wet waterline, the lid margin, then skin falling into shadow */
  float below=yl-uv.y;
  float water=exp(-pow((below-.014)/.011,2.))*.55*(1.-smoothstep(.8,1.02,abs(x)));
  float margin=smoothstep(.01,.035,below)*smoothstep(.1,.045,below)*.36*(1.-x*x*.5)*smoothstep(1.08,.7,abs(x));
  float loSkin=skin+.07*exp(-pow((below-.15)/.07,2.))*(1.-x*x)+margin;
  loSkin*=smoothstep(1.35,.6,abs(x))*smoothstep(.75,.12,below);
  float skinMask=1.-inside;
  col+=skinMask*(uv.y>yu?upSkin:loSkin)+water*skinMask;
  /* upper lid edge: a heavy, soft dark line of lashes */
  float lidEdge=exp(-pow((above-.01)/.028,2.))*smoothstep(1.05,.6,abs(x));
  float strands=n3(vec3(x*140.,above*14.,3.));
  col=mix(col,vec3(.008),clamp(lidEdge*(.75+.35*strands),0.,1.));
  /* lower lashes: a few short bright spikes hanging off the rim */
  float lx2=x*26.+.3;float lj=floor(lx2);float lg=fract(lx2)-.5;
  float ll2=.035+.05*h1(lj*3.1);
  float bend=below-.08;
  float lashL=smoothstep(.09,.0,abs(lg-bend*3.*(.4+x)))*step(.08,below)*step(below,.08+ll2)*step(abs(x),.85)*step(.5,h1(lj*7.3));
  col+=lashL*.22*(1.-bend/ll2);
  /* ---------- film ---------- */
  col*=F;                                          /* exposure flicker */
  float gr=h3(vec3(gl_FragCoord.xy,floor(t*24.)));
  col+=(gr-.5)*.07;
  /* scratches: thin diagonal hairlines that come and go */
  float sf=floor(t*12.);
  for(int i=0;i<3;i++){
    float fi=float(i);
    float on=step(.55,h1(sf*1.3+fi*17.));
    float xp=h1(sf*.7+fi*5.)*2.-1.;
    float d=abs((uv.x-xp)-(uv.y)*(.25+.2*h1(fi*9.)));
    col+=on*smoothstep(.004,.0,d)*smoothstep(-1.,.0,-uv.y)*.12*(.5+.5*h1(floor(uv.y*20.)+sf));
  }
  float dust=step(.9985,h3(vec3(floor(gl_FragCoord.xy/2.),floor(t*12.))));
  col+=dust*.25;
  /* vignette, then melt into the page colour before the canvas edge */
  col*=1.-smoothstep(.5,1.25,length(uv*vec2(.8,1.25)));
  vec2 fn=(gl_FragCoord.xy-.5*R)/(.5*R);
  float edge=(1.-smoothstep(.7,.98,abs(fn.x)))*(1.-smoothstep(.7,.98,abs(fn.y)));
  col=mix(vec3(0.),col,edge*edge);
  vec3 o=pow(max(col,0.),vec3(.95));
  gl_FragColor=vec4(.0196+o*(1.-.0196),1.);       /* never darker than the page */
}`;

  function make(canvas, opts = {}) {
    const gl = canvas.getContext("webgl", { antialias: false, alpha: false, premultipliedAlpha: false, powerPreference: "high-performance", preserveDrawingBuffer: !!opts.snapshot });
    if (!gl) { canvas.classList.add("noeye"); return null; }
    const sh = (t, s) => { const o = gl.createShader(t); gl.shaderSource(o, s); gl.compileShader(o); if (!gl.getShaderParameter(o, gl.COMPILE_STATUS)) throw gl.getShaderInfoLog(o); return o; };
    const pg = gl.createProgram();
    try { gl.attachShader(pg, sh(gl.VERTEX_SHADER, VS)); gl.attachShader(pg, sh(gl.FRAGMENT_SHADER, FS)); gl.linkProgram(pg); }
    catch (e) { console.warn(e); canvas.classList.add("noeye"); return null; }
    gl.useProgram(pg);
    const b = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, b);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const al = gl.getAttribLocation(pg, "a"); gl.enableVertexAttribArray(al); gl.vertexAttribPointer(al, 2, gl.FLOAT, false, 0, 0);
    const U = {}; for (const k of ["R", "T", "G", "P", "B", "Z", "F"]) U[k] = gl.getUniformLocation(pg, k);

    let scale = opts.scale || (matchMedia("(max-width: 760px)").matches ? 0.7 : 0.85);
    let gx = 0, gy = 0, tx = 0, ty = 0, pupil = .16, blink = 0, blinkT = -1, nextBlink = 2.5, zoom = opts.zoom || 0.8;
    let visible = true, raf = 0, last = performance.now(), slow = 0, dart = .6, lastPointer = -1e9, flick = 1;
    const still = matchMedia("(prefers-reduced-motion: reduce)").matches;
    // a scripted clock lets the same eye be rendered frame-by-frame into a video
    const clock = opts.clock || (() => performance.now());

    function size() {
      const d = Math.min(devicePixelRatio || 1, 2), r = canvas.getBoundingClientRect();
      canvas.width = Math.max(64, Math.round((opts.width || r.width * d) * scale)); canvas.height = Math.max(64, Math.round((opts.height || r.height * d) * scale));
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    function step(dt, now) {
      // nervous glances: snap to a new spot every so often unless the cursor moved recently
      if ((dart -= dt) < 0) {
        dart = .35 + Math.random() * 1.4;
        if (now - lastPointer > 2500) {
          const k = Math.random();
          tx = k < .2 ? 0 : (Math.random() * 2 - 1) * .95;
          ty = (Math.random() * 2 - 1) * (k < .2 ? .2 : .9);
        }
      }
      gx += (tx - gx) * Math.min(1, dt * 22); gy += (ty - gy) * Math.min(1, dt * 22);
      // blinks: quick close, slower open
      if ((nextBlink -= dt) < 0) { blinkT = 0; nextBlink = 2.5 + Math.random() * 4.5; }
      if (blinkT >= 0) { blinkT += dt; const c = .07, o = .16; blink = blinkT < c ? blinkT / c : Math.max(0, 1 - (blinkT - c) / o); if (blinkT > c + o) blinkT = -1; }
      flick += ((.93 + Math.random() * .1) - flick) * .5;
    }
    function render(now) {
      gl.uniform2f(U.R, canvas.width, canvas.height); gl.uniform1f(U.T, now / 1000);
      gl.uniform2f(U.G, gx, gy); gl.uniform1f(U.P, pupil); gl.uniform1f(U.B, blink); gl.uniform1f(U.Z, zoom); gl.uniform1f(U.F, flick);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
    function frame(now) {
      const dt = Math.min(0.05, (now - last) / 1000); last = now;
      if (!opts.clock && dt > 0.034 && ++slow > 40 && scale > 0.5) { scale -= 0.15; slow = 0; size(); } else if (dt < 0.03) slow = Math.max(0, slow - 1);
      step(dt, now); render(now);
    }
    function loop() { raf = requestAnimationFrame(loop); frame(clock()); }
    function start() { if (!opts.clock && !raf && visible && !document.hidden && !still) { last = clock(); raf = requestAnimationFrame(loop); } }
    function stop() { cancelAnimationFrame(raf); raf = 0; }
    size(); render(clock());
    if (!opts.width && window.ResizeObserver) new ResizeObserver(() => { size(); render(clock()); }).observe(canvas);
    if (opts.follow) addEventListener("pointermove", e => {
      const r = canvas.getBoundingClientRect(), cx = r.left + r.width / 2, cy = r.top + r.height / 2;
      tx = Math.max(-.95, Math.min(.95, (e.clientX - cx) / Math.max(innerWidth * .4, 1)));
      ty = Math.max(-.9, Math.min(.9, -(e.clientY - cy) / Math.max(innerHeight * .4, 1)));
      lastPointer = clock();
    }, { passive: true });
    if (!opts.clock) {
      new IntersectionObserver(es => { visible = es[0].isIntersecting; visible ? start() : stop(); }).observe(canvas);
      document.addEventListener("visibilitychange", () => document.hidden ? stop() : start());
      start();
    }
    return {
      excite() { blinkT = 0; },
      dilate(v) { pupil = v; },
      zoom(v) { zoom = v; },
      look(x, y) { tx = x; ty = y; },
      track(x, y) { tx = Math.max(-1, Math.min(1, x)); ty = Math.max(-1, Math.min(1, y)); lastPointer = clock(); },
      blink() { if (blinkT < 0) blinkT = 0; },
      tick(dtSec, now) { step(dtSec, now); render(now); },
      snapshot() { render(clock()); return canvas.toDataURL("image/png"); },
    };
  }
  return { make };
})();
;
/* 1EYE Instagram kit — builds a post (1080×1350 JPEG) or a reel (1080×1920 MP4) entirely in the page,
   with the live noir eye, then hands it to Instagram's own upload field. Needs window.Noir (noir.js) and
   window.Mp4Muxer (mp4-muxer, MIT) in the same bundle. Reels are encoded frame by frame with WebCodecs, so
   they come out smooth even when the tab is in the background. */
window.IGKit = (() => {
  const INK = "#f1f0eb", MUTED = "#8d8c86", DIM = "#55544f", ACC = "#c9f27a", RED = "#e0483c", BG = "#050505";
  const SANS = '"Segoe UI Variable Display","Segoe UI","Helvetica Neue",Arial,sans-serif';
  const MONO = '"Cascadia Mono","JetBrains Mono",Consolas,"SFMono-Regular",monospace';

  function eye(w, h, zoom) {
    const c = document.createElement("canvas");
    let T = 2000 + Math.random() * 5000;
    const E = Noir.make(c, { clock: () => T, width: w, height: h, scale: 1, zoom, snapshot: true });
    return { c, step(dt) { T += dt * 1000; E.tick(dt, T); }, look(x, y) { E.look(x, y); }, blink() { E.blink && E.blink(); } };
  }
  function grid(g, W, H) {
    g.fillStyle = "rgba(241,240,235,.10)";
    for (let y = 60; y < H; y += 120) for (let x = 60; x < W; x += 120) { g.fillRect(x - 6, y, 13, 1); g.fillRect(x, y - 6, 1, 13); }
  }
  function spaced(g, text, x, y, gap) { for (const ch of text) { g.fillText(ch, x, y); x += g.measureText(ch).width + gap; } return x; }
  function corners(g, x, y, w, h, n) {
    g.strokeStyle = "rgba(241,240,235,.35)"; g.lineWidth = 2;
    for (const [cx, cy, sx, sy] of [[x, y, 1, 1], [x + w, y, -1, 1], [x, y + h, 1, -1], [x + w, y + h, -1, -1]]) {
      g.beginPath(); g.moveTo(cx, cy + sy * n); g.lineTo(cx, cy); g.lineTo(cx + sx * n, cy); g.stroke();
    }
  }
  function lines(g, arr, x, y, size, lh) {
    // arr: strings; a line starting with "~" is muted
    g.font = `700 ${size}px ${SANS}`; if ("letterSpacing" in g) g.letterSpacing = `${-size * .035}px`;
    arr.forEach((t, i) => { const m = t[0] === "~"; g.fillStyle = m ? MUTED : INK; g.fillText(m ? t.slice(1) : t, x, y + i * lh); });
    if ("letterSpacing" in g) g.letterSpacing = "0px";
  }
  function fitSize(g, arr, max, size) {
    for (; size > 40; size -= 2) { g.font = `700 ${size}px ${SANS}`; if (arr.every(t => g.measureText(t.replace(/^~/, "")).width <= max)) break; }
    return size;
  }

  /* POST: label, headline lines, the eye in a viewfinder, footer. */
  async function post({ label = "1EYE / OPEN SOURCE LAB", title = ["One eye.", "~Open source."], body = "", index = "", cta = "1eye.dpdns.org" } = {}) {
    const W = 1080, H = 1350, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d"); g.fillStyle = BG; g.fillRect(0, 0, W, H); grid(g, W, H);
    g.font = `500 22px ${MONO}`; g.fillStyle = ACC; g.textBaseline = "alphabetic";
    g.fillRect(72, 92, 40, 2); g.fillStyle = INK; spaced(g, label.toUpperCase(), 128, 100, 3);
    const size = fitSize(g, title, W - 144, 118);
    lines(g, title, 68, 150 + size, size, size * 1.02);
    const top = 150 + size * title.length * 1.02 + 30;
    const ew = W - 120, eh = Math.min(560, H - top - 210);
    const e = eye(ew, eh, .78); for (let i = 0; i < 50; i++) e.step(1 / 30);
    g.drawImage(e.c, 60, top, ew, eh); corners(g, 60, top, ew, eh, 34);
    g.font = `500 18px ${MONO}`; g.fillStyle = MUTED;
    spaced(g, "[ MACRO 1:1 ]", 84, top + 34, 2); spaced(g, "[ LIVE · NOIR ]", W - 270, top + eh - 18, 2);
    if (body) { g.font = `400 30px ${SANS}`; g.fillStyle = MUTED; wrap(g, body, 68, top + eh + 62, W - 140, 40); }
    g.fillStyle = "rgba(241,240,235,.18)"; g.fillRect(68, H - 112, W - 136, 1);
    g.font = `800 34px ${SANS}`; g.fillStyle = INK; spaced(g, "1EYE", 68, H - 58, 3);
    g.font = `500 22px ${MONO}`; g.fillStyle = MUTED; spaced(g, cta, 188, H - 61, 1);
    if (index) { g.fillStyle = ACC; spaced(g, `[ ${index} ]`, W - 210, H - 61, 2); }
    const blob = await new Promise(r => c.toBlob(r, "image/jpeg", .94));
    return new File([blob], "1eye-post.jpg", { type: "image/jpeg" });
  }
  function wrap(g, text, x, y, max, lh) {
    let line = "", n = 0;
    for (const w of text.split(" ")) { const t = line ? line + " " + w : w; if (g.measureText(t).width > max && line) { g.fillText(line, x, y + n++ * lh); line = w; } else line = t; }
    if (line) g.fillText(line, x, y + n * lh);
  }

  /* REEL: the eye fills the frame, darting and blinking; captions appear in sequence.
     beats: [{t:"Stop emailing", at:0.2}, {t:"~files to yourself.", at:1.2}, ...]; seconds: length */
  async function reel({ beats = [], seconds = 8, label = "1EYE", cta = "1eye.dpdns.org", fps = 30 } = {}) {
    const W = 1080, H = 1920, c = document.createElement("canvas"); c.width = W; c.height = H;
    const g = c.getContext("2d");
    const e = eye(W, 1150, .62);
    const target = new Mp4Muxer.ArrayBufferTarget();
    const mux = new Mp4Muxer.Muxer({ target, video: { codec: "avc", width: W, height: H }, fastStart: "in-memory" });
    let err = null;
    const enc = new VideoEncoder({ output: (ch, meta) => mux.addVideoChunk(ch, meta), error: x => err = x });
    enc.configure({ codec: "avc1.640028", width: W, height: H, bitrate: 7_000_000, framerate: fps });
    const frames = Math.round(seconds * fps), ease = k => 1 - Math.pow(1 - Math.min(1, Math.max(0, k)), 3);
    for (let f = 0; f < frames; f++) {
      const t = f / fps;
      e.step(1 / fps);
      g.fillStyle = BG; g.fillRect(0, 0, W, H); grid(g, W, H);
      g.drawImage(e.c, 0, 470);
      g.font = `500 26px ${MONO}`; g.fillStyle = ACC; g.fillRect(72, 132, 44, 2); g.fillStyle = INK; spaced(g, label.toUpperCase(), 134, 141, 4);
      let y = 300;
      const size = fitSize(g, beats.map(b => b.t), W - 144, 104);
      for (const b of beats) {
        const k = ease((t - b.at) / .45); if (k <= 0) { y += size * 1.05; continue; }
        g.globalAlpha = k; g.save(); g.translate(0, (1 - k) * 40);
        lines(g, [b.t], 68, y, size, size); g.restore(); g.globalAlpha = 1; y += size * 1.05;
      }
      const k = ease((t - (seconds - 2.4)) / .5);
      if (k > 0) {
        g.globalAlpha = k;
        g.font = `800 64px ${SANS}`; g.fillStyle = INK; spaced(g, "1EYE", 68, H - 250, 4);
        g.font = `500 34px ${MONO}`; g.fillStyle = ACC; spaced(g, cta, 70, H - 190, 2);
        g.font = `500 26px ${MONO}`; g.fillStyle = MUTED; spaced(g, "FREE · OPEN SOURCE · LINK IN BIO", 70, H - 140, 3);
        g.globalAlpha = 1;
      }
      const vf = new VideoFrame(c, { timestamp: Math.round(f * 1e6 / fps), duration: Math.round(1e6 / fps) });
      enc.encode(vf, { keyFrame: f % (fps * 2) === 0 }); vf.close();
      if (enc.encodeQueueSize > 8) await new Promise(r => setTimeout(r, 5));
      if (err) throw err;
    }
    await enc.flush(); mux.finalize();
    return new File([target.buffer], "1eye-reel.mp4", { type: "video/mp4" });
  }

  /* Hand the file to Instagram's create-post upload field (the one that also takes video). */
  function attach(file) {
    const inputs = [...document.querySelectorAll("input[type=file]")];
    const inp = inputs.find(i => /video\/mp4/.test(i.accept || "")) || inputs[inputs.length - 1];
    if (!inp) return "no upload field: open Create first";
    const dt = new DataTransfer(); dt.items.add(file); inp.files = dt.files;
    inp.dispatchEvent(new Event("change", { bubbles: true }));
    return "attached " + file.name + " (" + Math.round(file.size / 1024) + " KB)";
  }
  return { post, reel, attach };
})();
