exports.isValidStory = (asset) => {
  if (asset.resource_type !== "image") return false;

  
  const ratio = asset.width / asset.height;
  const isStoryRatio = ratio > 0.55 && ratio < 0.65;


  const minWidth = 720;
  const minHeight = 1280;
  const isHD = asset.width >= minWidth && asset.height >= minHeight;

  
  const isSizeOk = asset.bytes <= 5 * 1024 * 1024;

  const isRecent =
    Date.now() - new Date(asset.created_at).getTime() <
    7 * 24 * 60 * 60 * 1000;

 
  const isCorrectFolder = asset.folder === "ngo-stories";

  return isStoryRatio && isHD && isSizeOk && isRecent && isCorrectFolder;
};
