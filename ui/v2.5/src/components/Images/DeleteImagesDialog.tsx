import React, { useState } from "react";
import { Form } from "react-bootstrap";
import { useImagesDestroy } from "src/core/StashService";
import * as GQL from "src/core/generated-graphql";
import { Modal } from "src/components/Shared";
import { useToast } from "src/hooks";
import { ConfigurationContext } from "src/hooks/Config";
import { FormattedMessage, useIntl } from "react-intl";

interface IDeleteImageDialogProps {
  selected: GQL.SlimImageDataFragment[];
  onClose: (confirmed: boolean) => void;
}

export const DeleteImagesDialog: React.FC<IDeleteImageDialogProps> = (
  props: IDeleteImageDialogProps
) => {
  const intl = useIntl();
  const singularEntity = intl.formatMessage({ id: "image" });
  const pluralEntity = intl.formatMessage({ id: "images" });

  const header = intl.formatMessage(
    { id: "dialogs.delete_entity_title" },
    { count: props.selected.length, singularEntity, pluralEntity }
  );
  const toastMessage = intl.formatMessage(
    { id: "toast.delete_entity" },
    { count: props.selected.length, singularEntity, pluralEntity }
  );
  const message = intl.formatMessage(
    { id: "dialogs.delete_entity_desc" },
    { count: props.selected.length, singularEntity, pluralEntity }
  );

  const { configuration: config } = React.useContext(ConfigurationContext);

  const [deleteFile, setDeleteFile] = useState<boolean>(
    config?.defaults.deleteFile ?? false
  );
  const [deleteGenerated, setDeleteGenerated] = useState<boolean>(
    config?.defaults.deleteGenerated ?? true
  );

  const Toast = useToast();
  const [deleteImage] = useImagesDestroy(getImagesDeleteInput());

  // Network state
  const [isDeleting, setIsDeleting] = useState(false);

  function getImagesDeleteInput(): GQL.ImagesDestroyInput {
    return {
      ids: props.selected.map((image) => image.id),
      delete_file: deleteFile,
      delete_generated: deleteGenerated,
    };
  }

  async function onDelete() {
    setIsDeleting(true);
    try {
      await deleteImage();
      Toast.success({ content: toastMessage });
    } catch (e) {
      Toast.error(e);
    }
    setIsDeleting(false);
    props.onClose(true);
  }

  function maybeRenderDeleteFileAlert() {
    if (!deleteFile) {
      return;
    }

    return (
      <div className="delete-dialog alert alert-danger text-break">
        <p className="font-weight-bold">
          <FormattedMessage
            values={{
              count: props.selected.length,
              singularEntity: intl.formatMessage({ id: "file" }),
              pluralEntity: intl.formatMessage({ id: "files" }),
            }}
            id="dialogs.delete_alert"
          />
        </p>
        <ul>
          {props.selected.slice(0, 5).map((s) => (
            <li key={s.path}>{s.path}</li>
          ))}
          {props.selected.length > 5 && (
            <FormattedMessage
              values={{
                count: props.selected.length - 5,
                singularEntity: intl.formatMessage({ id: "file" }),
                pluralEntity: intl.formatMessage({ id: "files" }),
              }}
              id="dialogs.delete_object_overflow"
            />
          )}
        </ul>
      </div>
    );
  }

  return (
    <Modal
      show
      icon="trash-alt"
      header={header}
      accept={{
        variant: "danger",
        onClick: onDelete,
        text: intl.formatMessage({ id: "actions.delete" }),
      }}
      cancel={{
        onClick: () => props.onClose(false),
        text: intl.formatMessage({ id: "actions.cancel" }),
        variant: "secondary",
      }}
      isRunning={isDeleting}
    >
      <p>{message}</p>
      {maybeRenderDeleteFileAlert()}
      <Form>
        <Form.Check
          id="delete-image"
          checked={deleteFile}
          label={intl.formatMessage({ id: "actions.delete_file" })}
          onChange={() => setDeleteFile(!deleteFile)}
        />
        <Form.Check
          id="delete-image-generated"
          checked={deleteGenerated}
          label={intl.formatMessage({
            id: "actions.delete_generated_supporting_files",
          })}
          onChange={() => setDeleteGenerated(!deleteGenerated)}
        />
      </Form>
    </Modal>
  );
};
