require('dotenv').config();
const Sequelize = require('sequelize');

let params = {};
if (!process.env.LOCAL) { params = { dialect: 'postgres', protocol: 'postgres', logging: true, dialectOptions: { ssl: true } }; }
const sequelize = new Sequelize("postgres://hdgktyijnjettt:5a47e413c177d90d7af8ec47d98a95ce0b169a235dfb94fc613b7b97302fd587@ec2-23-21-96-159.compute-1.amazonaws.com:5432/d31buqsfi67mvk", params);

sequelize.authenticate()
  .then(() => console.log('Connection has been established successfully'))
  .catch(err => console.error('Unable to connect to database:', err));

const Videos = sequelize.define('videos', {
  videoName: Sequelize.STRING,
  creator: Sequelize.STRING,
  url: Sequelize.STRING,
  description: Sequelize.STRING,
  thumbnail: Sequelize.STRING,
});

const Users = sequelize.define('users', {
  fbId: Sequelize.STRING,
  firstName: Sequelize.STRING,
  lastName: Sequelize.STRING,
});

// const Playlist = sequelize.define('playlist', {
//   playlistName: Sequelize.STRING,
// });

// TODO we will need to refer to the Room ID when there are multiple room instances
const Rooms = sequelize.define('rooms', {
  indexKey: Sequelize.INTEGER,
  startTime: Sequelize.DATE,
  roomName: Sequelize.STRING,
  isPrivate: Sequelize.BOOLEAN,
});



const UsersRooms = sequelize.define('users_rooms', {
  isRoomHost: Sequelize.BOOLEAN,
});


// Users.sync({ force: true });
// Rooms.sync({ force: true });

UsersRooms.belongsTo(Users);
UsersRooms.belongsTo(Rooms);
Videos.belongsTo(Rooms);

// Videos.sync({ force: true });
// UsersRooms.sync({ force: true });


const createVideoEntry = (videoData, roomId) => {
  const videoEntry = {
    videoName: videoData.title,
    creator: videoData.creator,
    url: videoData.url,
    description: videoData.description,
    roomId: roomId,
    thumbnail: videoData.thumbnail,
  };
  return Videos.create(videoEntry); // returns a promise when called
};

const createUsers = (user) => {
  console.log('db user: ', user);

  return Users.findAll({
    where: {
      fbId: user.id
    }
  })
  .then(data => {
    if(!data.length && user.id !== 'undefined') {
      Users.create({
        fbId: user.id,
        firstName: user.firstName,
        lastName: user.lastName
      })
      .then(result => console.log('added user data: ', result))
      .catch(error => console.log('user db error: ', error))
    }
  });
}

// Room Queries
const getRoomProperties = roomId => Rooms.findById(roomId).then(room => room.dataValues);
const incrementIndex = roomId => Rooms.findById(roomId).then(room => room.increment('indexKey'));
const resetRoomIndex = roomId => Rooms.findById(roomId).then(room => room.update({ indexKey: 0 }));
const getIndex = roomId => Rooms.findById(roomId).then(room => room.dataValues.indexKey);
const setStartTime = roomId => Rooms.findById(roomId).then(room => room.update({ startTime: Date.now() }));
//const getRoomNames = () => Rooms.findAll({ where: { isPrivate: false } });
const getRoomNames = () => {return sequelize.query(`SELECT distinct on (r.id) r.*, v.thumbnail FROM rooms r
LEFT JOIN videos v
    ON v."roomId" = r.id
WHERE r."isPrivate" is FALSE`, { type: sequelize.QueryTypes.SELECT})};


const createRoom = (roomName, cb) => {
  Rooms.create({indexKey: 0, startTime: sequelize.fn('NOW'), roomName: `'${roomName}'`, isPrivate: false})
  .then((data) => {
  // console.log('!!!!!!', data.dataValues.id)
  console.log('added:', roomName )
  cb(data.dataValues.id)
  })
  .catch(error => console.log(error))
}

// Video Queries
const findVideos = roomId => sequelize.query(`select distinct on (date_trunc('second', "createdAt")) * from videos where "roomId" = ${roomId}`, { type: sequelize.QueryTypes.SELECT});
const removeFromPlaylist = (title, roomId, createdTime) => Videos.findAll({ where: { videoName: title, roomId: roomId , createdAt: createdTime} }).then(video => video.destroy());

exports.createVideoEntry = createVideoEntry;
exports.getRoomProperties = getRoomProperties;
exports.incrementIndex = incrementIndex;
exports.resetRoomIndex = resetRoomIndex;
exports.getIndex = getIndex;
exports.setStartTime = setStartTime;
exports.findVideos = findVideos;
exports.removeFromPlaylist = removeFromPlaylist;
exports.getRoomNames = getRoomNames;

exports.createRoom = createRoom;

exports.createUsers = createUsers;
