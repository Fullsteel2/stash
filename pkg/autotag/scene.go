package autotag

import (
	"github.com/stashapp/stash/pkg/models"
	"github.com/stashapp/stash/pkg/scene"
)

func getSceneFileTagger(s *models.Scene) tagger {
	return tagger{
		ID:   s.ID,
		Type: "scene",
		Name: s.GetTitle(),
		Path: s.Path,
	}
}

// ScenePerformers tags the provided scene with performers whose name matches the scene's path.
func ScenePerformers(s *models.Scene, rw models.SceneReaderWriter, performerReader models.PerformerReader) error {
	t := getSceneFileTagger(s)

	return t.tagPerformers(performerReader, func(subjectID, otherID int) (bool, error) {
		return scene.AddPerformer(rw, subjectID, otherID)
	})
}

// SceneStudios tags the provided scene with the first studio whose name matches the scene's path.
//
// Scenes will not be tagged if studio is already set.
func SceneStudios(s *models.Scene, rw models.SceneReaderWriter, studioReader models.StudioReader) error {
	if s.StudioID.Valid {
		// don't modify
		return nil
	}

	t := getSceneFileTagger(s)

	return t.tagStudios(studioReader, func(subjectID, otherID int) (bool, error) {
		return addSceneStudio(rw, subjectID, otherID)
	})
}

// SceneTags tags the provided scene with tags whose name matches the scene's path.
func SceneTags(s *models.Scene, rw models.SceneReaderWriter, tagReader models.TagReader) error {
	t := getSceneFileTagger(s)

	return t.tagTags(tagReader, func(subjectID, otherID int) (bool, error) {
		return scene.AddTag(rw, subjectID, otherID)
	})
}
