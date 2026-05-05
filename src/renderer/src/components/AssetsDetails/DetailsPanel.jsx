import DetailsItem from "./DetailsItem";

const DetailsPanel = () => {
  return (
    <div className="bg-card-bg border border-white/6 rounded-xl divide-y divide-white/6 ">
      <DetailsItem
        title="Account type"
        description="SegWit is the default address type in Trezor Suite. It reduces transaction size, boosts capacity, and enables smaller fees, but may not work with older services."
        value="SegWit (BIP84, P2WPKH, Bech32)"
        action="Learn more"
      />

      <DetailsItem
        title="Derivation path"
        description="The derivation path defines how keys are generated in a hierarchical deterministic wallet."
        value="m/84'/0'/0'"
        action="Learn more"
      />

      <DetailsItem
        title="Public key (XPUB)"
        description="Anyone with your XPUB can see your entire transaction history."
        action="Show public key"
        button
      />
    </div>
  );
};


export default DetailsPanel