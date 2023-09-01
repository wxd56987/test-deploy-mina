
import Head from 'next/head';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import GradientBG from '../components/GradientBG.js';
import styles from '../styles/Home.module.css';
import heroMinaLogo from '../../public/assets/hero-mina-logo.svg';
import arrowRightSmall from '../../public/assets/arrow-right-small.svg';

export default function Home() {
  const [add, setAdd] = useState<any>()

  return (
    <>
      <Head>
        <title>Mina zkApp UI</title>
        <meta name="description" content="built with SnarkyJS" />
        <link rel="icon" href="/assets/favicon.ico" />
      </Head>
      <GradientBG>
        <main className={styles.main}>
          <button
            className={styles.tagline}
            onClick={async () => {
              // @ts-ignore
              let accounts = await window.mina.requestAccounts();
              const { Mina, PublicKey, isReady, PrivateKey, fetchAccount, AccountUpdate } = await import('snarkyjs');
              const { Add } = await import('../../../contracts/build/src/Add');
              await isReady;
              console.log('SnarkyJS loaded');
              const Berkeley = Mina.Network(
                'https://proxy.berkeley.minaexplorer.com/graphql'
              );
              Mina.setActiveInstance(Berkeley);
              const transactionFee = 100_000_000;
              let { verificationKey } = await Add.compile()
              const deployAddress = PublicKey.fromBase58(accounts[0])
              const zkApp = new Add(deployAddress)

              let trans = await Mina.transaction(
                { sender: deployAddress, fee: transactionFee },
                () => {
                  AccountUpdate.fundNewAccount(deployAddress);
                  zkApp.deploy({ verificationKey });
                }
              );

              await trans.prove().catch(err => err)
              let partiesJsonUpdate = trans.toJSON();
              // @ts-ignore
              if (window.mina) {
                // @ts-ignore
                let partyResult = await window.mina.sendTransaction({
                  transaction: partiesJsonUpdate,
                  feePayer: {
                    memo: "zk deploy"
                  },
                }).catch()

                console.log("signPartyButton==1", partyResult);
              }
            }}
          >
            deploy contract
          </button>
        </main>
      </GradientBG >
    </>
  );
}
