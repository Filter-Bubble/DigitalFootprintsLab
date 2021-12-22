import db from "apis/dexie";
import PropTypes from "prop-types";
import React, { useState, useEffect } from "react";
import {
  Button, ButtonGroup, Modal
} from "semantic-ui-react";
import { useLiveQuery } from "dexie-react-hooks";

const propTypes = {
  /** The name of the table in DB */
  table: PropTypes.string,
};

const tables = ["browsinghistory", "searchhistory", "youtube"];

const ConfirmDonateModal = ({ confirm, setConfirm }) => {
  const [counts, setCounts] = useState({});
  const n = useLiveQuery(() => db.idb.table("browsinghistory").count()); //TODO: include other tables

  // Count the data being donated
  useEffect(() => {
    const getCounts = async () => {
      const counts = {};
      for (let t of tables) {
        counts[t] = await db.idb.table(t).count();
      }
      setCounts(counts);
    }
    getCounts();
  }, [setCounts, n]);

  // After donate confirmation
  const handleDonate = async () => {

    // Collect all data
    const data = {};
    const tableToJson = async (table) => {
      const t = await db.idb.table(table);
      const collection = await t.toCollection();
      data[table] = await collection.toArray();
    }
    await Promise.all(tables.map(async table => await tableToJson(table)));

    console.log(data);
    //TODO: send to endpoint

    // Close dialog
    setConfirm({ open: false, donated: true });
  };

  if (!confirm.open) return null;

  return (
    <Modal
      style={{ backgroundColor: "#00000054" }}
      open={confirm.open}
      onClose={() => setConfirm({ ...confirm, open: false, donated: false })}
    >
      <Modal.Header>Donate data</Modal.Header>
      <Modal.Content>
        <p>Thank you for considering to donate your data to this project.</p>
        <p>Please understand the following:</p>
        <ul>
          <li>Your data will be kept until 5 years after publishing the results of this project.</li>
          <li>Your data will never be shared with third parties.</li>
        </ul>
        <p>You wil be donating the following items: { Object.keys(counts).map(key => `${key}: ${counts[key]}`).join(', ') }</p>
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
            <Button fluid color="green" onClick={(e, d) => handleDonate()}>
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
