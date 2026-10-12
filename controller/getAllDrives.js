const connection = require("../config/dbconfig");

function getAllDrives(req, res) {
  console.log("Fetching all active drives...");

  const getDrivesQuery = `
    SELECT
      d.id,
      d.vendor_id,
      d.product_id,
      d.title,
      d.start_date,
      d.end_date,
      d.minimum_participants,
      d.maximum_participants,
      d.current_participants,
      d.status,
      d.created_at,
      d.updated_at,

      p.name AS product_name,
      p.description AS product_description,
      p.image AS product_image,
      p.stock AS product_stock,
      p.price AS product_price

    FROM drives d

    INNER JOIN products p
      ON d.product_id = p.id

    WHERE d.status = 'ACTIVE'
      AND p.is_active = 1
      AND NOW() BETWEEN d.start_date AND d.end_date

    ORDER BY d.id DESC
  `;

  connection.query(getDrivesQuery, (err, drives) => {
    if (err) {
      console.error("Error fetching drives:", err);

      return res.status(500).json({
        message: "Server error while fetching drives",
      });
    }

    if (drives.length === 0) {
      return res.status(200).json({
        message: "No active drives found",
        drives: [],
      });
    }

    const driveIds = drives.map((drive) => drive.id);

    const getDrivePeersQuery = `
      SELECT
        id,
        drive_id,
        minimum_participants,
        price,
        created_at,
        updated_at
      FROM drive_price_tiers
      WHERE drive_id IN (?)
      ORDER BY minimum_participants ASC
    `;

    connection.query(getDrivePeersQuery, [driveIds], (peerErr, peers) => {
      if (peerErr) {
        console.error("Error fetching drive price tiers:", peerErr);

        return res.status(500).json({
          message: "Server error while fetching drive price tiers",
        });
      }

      const formattedDrives = drives.map((drive) => {
        const drivePeers = peers
          .filter((peer) => peer.drive_id === drive.id)
          .sort((a, b) => a.minimum_participants - b.minimum_participants);

        const currentParticipants = Number(drive.current_participants) || 0;

        /*
         * Find the current applicable tier.
         *
         * Example:
         * 2  -> ₹46,000
         * 5  -> ₹44,000
         * 10 -> ₹41,999
         * 15 -> ₹39,999
         *
         * If 7 people have joined:
         * current tier = 5
         * current price = ₹44,000
         * next tier = 10
         */
        let currentTier = null;
        let nextTier = null;

        for (const tier of drivePeers) {
          const minimumParticipants = Number(tier.minimum_participants);

          if (currentParticipants >= minimumParticipants) {
            currentTier = tier;
          } else if (!nextTier) {
            nextTier = tier;
          }
        }

        /*
         * If nobody has reached the first tier,
         * use the first tier as the current/starting price.
         */
        if (!currentTier && drivePeers.length > 0) {
          currentTier = drivePeers[0];

          nextTier = drivePeers.length > 1 ? drivePeers[1] : null;
        }

        let currentPrice = null;
        let nextPrice = null;
        let nextPriceParticipants = null;
        let peopleNeeded = 0;

        if (currentTier) {
          currentPrice = Number(currentTier.price);
        }

        if (nextTier) {
          nextPrice = Number(nextTier.price);
          nextPriceParticipants = Number(nextTier.minimum_participants);

          peopleNeeded = Math.max(
            nextPriceParticipants - currentParticipants,
            0,
          );
        }

        return {
          id: drive.id,

          vendor_id: drive.vendor_id,

          product_id: drive.product_id,

          title: drive.title,

          start_date: drive.start_date,

          end_date: drive.end_date,

          minimum_participants: drive.minimum_participants,

          maximum_participants: drive.maximum_participants,

          current_participants: currentParticipants,

          status: drive.status,

          /*
           * Pricing calculated from drive_price_tiers
           */
          current_price: currentPrice,

          next_price: nextPrice,

          next_price_participants: nextPriceParticipants,

          people_needed: peopleNeeded,

          /*
           * Complete price tiers
           */
          price_tiers: drivePeers,

          /*
           * Product information
           */
          product: {
            id: drive.product_id,

            name: drive.product_name,

            description: drive.product_description,

            image: drive.product_image,

            stock: drive.product_stock,
            price: drive.product_price,
          },
        };
      });

      return res.status(200).json({
        message: "Drives fetched successfully",
        drives: formattedDrives,
      });
    });
  });
}

module.exports = getAllDrives;
