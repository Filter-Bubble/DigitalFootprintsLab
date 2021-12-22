import db from "apis/dexie";
import PropTypes from "prop-types";
import React, { useState } from "react";
import {
  Button, ButtonGroup, Modal
} from "semantic-ui-react";

const propTypes = {
  /** The name of the table in DB */
  table: PropTypes.string,
};

const ConfirmDonateModal = ({ table, confirm, setConfirm }) => {
  const n = confirm.itemIds.length;

  const handleDonate = async () => {
    // await db.deleteTableIds(table, confirm.itemIds);
    // setConfirm({ open: false, ask: !ask, itemIds: [] });
    //TODO
  };

  if (!confirm.open) return null;

  return (
    <Modal
      style={{ backgroundColor: "#00000054" }}
      open={confirm.open}
      onClose={() => setConfirm({ ...confirm, open: false })}
    >
      <Modal.Header>Donate data</Modal.Header>
      <Modal.Content>
        <p>Thank you for considering to donate your data to this project</p>
        <p>Please understand the following:</p>
        <p><ul>
          <li>Your data will be kept until 5 years after publishing the results of this project.</li>
          <li>Your data will never be shared with third parties.</li>
        </ul></p>
        <p>You wil be donating *** n *** items for the last *** m *** months.</p>
        <p>If you click on "Confirm", your data will be uploaded. If you want to check your data again and
          filter out items you do not want to share, please click on "Go Back". You will get back to the
          overview page.</p>
        <p>After uploading your data, you will receive some more interesting facts about your online self!</p>
        <br />
        <Modal.Actions>
          <ButtonGroup centered="true">
            <Button
              fluid
              primary
              onClick={() => setConfirm({ open: false, itemIds: [] })}
            >
              Go Back
            </Button>
            <Button fluid color="Green" onClick={(e, d) => handleDonate()}>
              Confirm
            </Button>
          </ButtonGroup>
        </Modal.Actions>
      </Modal.Content>
    </Modal>
  );
};

ConfirmDonateModal.propTypes = propTypes;
export default React.memo(ConfirmDonateModal);
