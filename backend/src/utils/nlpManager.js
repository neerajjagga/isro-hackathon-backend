import { NlpManager } from 'node-nlp';

const manager = new NlpManager({ languages: ['en'], forceNER: true });

export const trainNLP = async () => {
  // === Intent: get.cloud.data ===
  manager.addDocument('en', 'show me cloud data', 'get.cloud.data');
  manager.addDocument('en', 'I want cloud motion imagery', 'get.cloud.data');
  manager.addDocument('en', 'give me satellite cloud motion info', 'get.cloud.data');
  manager.addDocument('en', 'cloud motion from INSAT', 'get.cloud.data');
  manager.addDocument('en', 'can I get cloud observation', 'get.cloud.data');

  // === Intent: get.rainfall.data ===
  manager.addDocument('en', 'give me rainfall info', 'get.rainfall.data');
  manager.addDocument('en', 'rainfall data for northeast', 'get.rainfall.data');
  manager.addDocument('en', 'how much it rained in NE region', 'get.rainfall.data');
  manager.addDocument('en', 'show rainfall statistics', 'get.rainfall.data');
  manager.addDocument('en', 'rainfall details for today', 'get.rainfall.data');

  // === Intent: get.satellite.data ===
  manager.addDocument('en', 'I want satellite data', 'get.satellite.data');
  manager.addDocument('en', 'give me INSAT data', 'get.satellite.data');
  manager.addDocument('en', 'need latest satellite images', 'get.satellite.data');
  manager.addDocument('en', 'satellite info please', 'get.satellite.data');
  manager.addDocument('en', 'show satellite coverage', 'get.satellite.data');

  // === Intent: get.satellite.capabilities ===
  manager.addDocument('en', 'what does INSAT-3DR provide', 'get.satellite.capabilities');
  manager.addDocument('en', 'capabilities of INSAT-3D', 'get.satellite.capabilities');
  manager.addDocument('en', 'functions of Kalpana-1', 'get.satellite.capabilities');
  manager.addDocument('en', 'what is INSAT used for', 'get.satellite.capabilities');
  manager.addDocument('en', 'which services does INSAT give', 'get.satellite.capabilities');

  // === Named Entities: Satellites ===
  manager.addNamedEntityText('satellite', 'INSAT-3DR', ['en'], [
    'insat 3dr', 'insat-3dr', 'insat three dr', '3dr satellite'
  ]);
  manager.addNamedEntityText('satellite', 'INSAT-3D', ['en'], [
    'insat 3d', 'insat-3d', 'insat three d', '3d satellite'
  ]);
  manager.addNamedEntityText('satellite', 'Kalpana-1', ['en'], [
    'kalpana 1', 'kalpana-1', 'kalpana one', 'kalpana satellite'
  ]);

  // === Named Entities: Regions ===
  manager.addNamedEntityText('region', 'Northeast India', ['en'], [
    'northeast', 'northeast region', 'north east', 'NE', 'n e india'
  ]);
  manager.addNamedEntityText('region', 'India', ['en'], [
    'india', 'bharat', 'hindustan', 'the country'
  ]);

  await manager.train();
  await manager.save();
  console.log('NLP training complete');
};

export const loadNLP = async () => {
  await manager.load();
  return manager;
};

export { manager };
