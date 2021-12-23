import db from "apis/dexie";
import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Button, ButtonGroup, Checkbox, Modal
} from "semantic-ui-react";

const propTypes = {
  /** The name of the table in DB */
  table: PropTypes.string,
};

const ConfirmDeleteModal = ({ table, confirm, setConfirm }) => {
  const [ask, setAsk] = useState(!confirm.ask);
  const n = confirm.itemIds.length;

  const handleDelete = async () => {
    await db.deleteTableIds(table, confirm.itemIds);
    setConfirm({ open: false, ask: !ask, itemIds: [] });
  };

  if (!confirm.open) return null;

  if (!confirm.ask && n === 1) {
    handleDelete();
    return null;
  }

  return (
    <Modal
      style={{ backgroundColor: "#00000054" }}
      open={confirm.open}
      onClose={() => setConfirm({ ...confirm, open: false })}
    >
      <Modal.Header>Delete item{n === 1 ? "" : "s"}</Modal.Header>
      <Modal.Content>
        <p>Are you sure you want to delete {n === 1 ? "this item" : `${n} items`}?</p>

        <br />
        <Modal.Actions>
          <ButtonGroup centered="true">
            <Button
              fluid
              primary
              onClick={() => setConfirm({ open: false, ask: !ask, itemIds: [] })}
            >
              Cancel
            </Button>
            <Button fluid color="red" onClick={(e, d) => handleDelete()}>
              Yes
            </Button>
          </ButtonGroup>
          {n > 1 ? null : (
            <Checkbox
              style={{ float: "right" }}
              onChange={(e, d) => setAsk(!d.value)}
              label="Do not ask again. Next time, delete immediately when clicking the trash icon"
            />
          )}
        </Modal.Actions>
      </Modal.Content>
    </Modal>
  );
};

ConfirmDeleteModal.propTypes = propTypes;
export default React.memo(ConfirmDeleteModal);
