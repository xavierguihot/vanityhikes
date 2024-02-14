
var googleDriveBaseUri = "https://drive.google.com"

var fullPhotoBaseUri = `${googleDriveBaseUri}/uc`

function fullPhoto(googleDriveId) {
  //return `${fullPhotoBaseUri}?id=${googleDriveId}&export=view`;
  return thumbnailForWidth(googleDriveId, 3200);
}

function fullPhotoForDownload(googleDriveId) {
  return `${fullPhotoBaseUri}?id=${googleDriveId}&export=download`;
}

var thumbnailBaseUri = `${googleDriveBaseUri}/thumbnail`

function thumbnailForWidth(googleDriveId, width) {
  return `${thumbnailBaseUri}?id=${googleDriveId}&export=download&sz=w${width}`;
}

function thumbnailForHeight(googleDriveId, height) {
  return `${thumbnailBaseUri}?id=${googleDriveId}&export=download&sz=h${height}`;
}
