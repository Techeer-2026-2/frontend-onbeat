// API 연결 시 이 배열을 서비스 응답 데이터로 교체하면 됩니다.
const a='/assets/albums/';
const coreSongs = [
 {id:'seven',title:'Seven (feat. Latto)',artist:'정국 (Jung Kook)',duration:184,cover:a+'seven.webp',category:'K-POP',likes:5700},
 {id:'magnetic',title:'Magnetic',artist:'ILLIT',duration:161,cover:a+'magnetic.webp',category:'K-POP',likes:4200},
 {id:'sasil',title:'사실말야',artist:'KISS OF LIFE',duration:189,cover:a+'floral.webp',category:'K-POP',likes:2800},
 {id:'how-sweet',title:'How Sweet',artist:'NewJeans',duration:188,cover:a+'how-sweet.webp',category:'K-POP',likes:6700},
 {id:'supernova',title:'Supernova',artist:'aespa',duration:194,cover:a+'supernova.webp',category:'K-POP',likes:5400},
 {id:'sonagi',title:'소나기',artist:'이클립스',duration:207,cover:a+'sonagi.webp',category:'발라드',likes:3900},
 {id:'blue-hour',title:'Blue Hour',artist:'TOMORROW X TOGETHER',duration:212,cover:a+'blue-hour.webp',category:'K-POP',likes:3800},
 {id:'sarang',title:'사랑은 늘 도망가',artist:'임영웅',duration:242,cover:a+'daisy.webp',category:'발라드',likes:2900},
 {id:'sunny',title:'여름의 향기',artist:'OnBeat Studio',duration:216,cover:a+'dolphin.webp',category:'인디',likes:1300},
 {id:'clover',title:'행운의 하루',artist:'OnBeat Studio',duration:203,cover:a+'shamrock.webp',category:'인디',likes:980},
 {id:'afterglow',title:'Afterglow',artist:'OnBeat Studio',duration:208,cover:a+'cd.webp',category:'팝',likes:900},
 {id:'green',title:'초록빛 기억',artist:'OnBeat Studio',duration:190,cover:a+'headphones-meadow.webp',category:'인디',likes:840},
];
const chartTitles=['Sunrise Drive','하늘빛 산책','Aqua Memory','도시의 파도','Cloudy Day','달빛 아래서','Blue Lagoon','우리의 여름','Neon Station','바람이 분다','Ocean Letter','유리창 너머'];
const chartArtists=['OnBeat Studio','Aero Sound','Bluewave','Mellow City','Cloudy Notes','Vista Band'];
const chartCovers=['seven.webp','magnetic.webp','floral.webp','how-sweet.webp','supernova.webp','sonagi.webp','blue-hour.webp','daisy.webp','dolphin.webp','shamrock.webp','cd.webp','headphones-meadow.webp'];
const makeChartSongs=(prefix,count,offset)=>Array.from({length:count},(_,index)=>({id:`${prefix}-${index+1}`,title:`${chartTitles[(index+offset)%chartTitles.length]} ${String(index+1).padStart(2,'0')}`,artist:chartArtists[(index+offset)%chartArtists.length],duration:176+((index*13+offset*7)%72),cover:a+chartCovers[(index+offset)%chartCovers.length],category:index%3===0?'K-POP':index%3===1?'인디':'팝',likes:8000-index*37}));
const globalChartSongs=makeChartSongs('chart-global',97,0);
const nearbyChartSongs=makeChartSongs('chart-nearby',47,5);
export const initialSongs = [...coreSongs,...globalChartSongs,...nearbyChartSongs];
export const topGlobal=['seven','magnetic','sasil'];
export const topNearby=['how-sweet','supernova','sonagi'];
export const chartTop100=[...topGlobal,...globalChartSongs.map(song=>song.id)];
export const chartNearby50=[...topNearby,...nearbyChartSongs.map(song=>song.id)];
export const commuteSongIds=['seven','magnetic','how-sweet','blue-hour','supernova','sonagi','sasil','sarang','sunny','clover','afterglow','green'];
export const secondsToTime=(seconds)=>`${Math.floor(seconds/60)}:${String(seconds%60).padStart(2,'0')}`;
export const totalTime=(songs)=>songs.reduce((acc,s)=>acc+(s?.duration||0),0);
export const durationLabel=(seconds)=>seconds>=3600?`${Math.floor(seconds/3600)}시간 ${Math.floor((seconds%3600)/60)}분`:`${Math.ceil(seconds/60)}분`;
