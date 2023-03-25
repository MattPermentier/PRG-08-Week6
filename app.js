import { DecisionTree } from "./libraries/decisiontree.js";
import { VegaTree } from "./libraries/vegatree.js";

// confusion table datacells
let edibleTable = document.getElementById("edible");
let notEdibleTable = document.getElementById("notEdible");
let poisonTable = document.getElementById("poison");
let notPoisonTable = document.getElementById("notPoison");

//global variables
let predictedPoison = 0;
let predictedEdible = 0;
let isPoison = 0;
let isEdible = 0;

//
// DATA
//
const csvFile = "./data/mushrooms.csv";
const trainingLabel = "class";
const ignored = ["class"];

//
// laad csv data als json
//
function loadData() {
  Papa.parse(csvFile, {
    download: true,
    header: true,
    dynamicTyping: true,
    complete: (results) => trainModel(results.data), // gebruik deze data om te trainen
  });
}

//
// MACHINE LEARNING - Decision Tree
//
function trainModel(data) {
  // todo : splits data in traindata en testdata
  let trainData = data.slice(0, Math.floor(data.length * 0.8));
  let testData = data.slice(Math.floor(data.length * 0.8) + 1);

  // maak het algoritme aan
  let decisionTree = new DecisionTree({
    ignoredAttributes: ignored,
    trainingSet: data,
    categoryAttr: trainingLabel,
  });

  // Teken de boomstructuur - DOM element, breedte, hoogte, decision tree
  let visual = new VegaTree("#view", 800, 400, decisionTree.toJSON());

  // todo : maak een prediction met een sample uit de testdata
  let poisonousTest = testData[0];
  let poisonousPrediction = decisionTree.predict(poisonousTest);
  if (poisonousPrediction === "p") {
    console.log(`Deze is giftig`);
  } else {
    console.log("Deze is eetbaar");
  }

  // todo : bereken de accuracy met behulp van alle test data
  function accuracy(data, tree) {
    let correct = 0;
    for (const row of data) {
      if (row.class === tree.predict(row)) {
        correct++;
      }
    }
    let element = document.getElementById("accuracy");
    element.innerText = `Accuracy: ${(correct / data.length) * 100}%`;
    console.log(`Accuracy: ${(correct / data.length) * 100}%`);
  }

  //train and test accuracy
  accuracy(trainData, decisionTree);
  accuracy(testData, decisionTree);

  for (const row of data) {
    if (row.class === "e" && decisionTree.predict(row) === "p") {
      isPoison++;
    } else if (row.class === "e" && decisionTree.predict(row) === "e") {
      predictedEdible++;
    } else if (row.class === "p" && decisionTree.predict(row) === "e") {
      isEdible++;
    } else if (row.class === "p" && decisionTree.predict(row) === "p") {
      predictedPoison++;
    }
  }

  edibleTable.innerText = predictedEdible;
  notEdibleTable.innerText = isEdible;
  poisonTable.innerText = isPoison;
  notPoisonTable.innerText = predictedPoison;

  let json = decisionTree.toJSON();
  // let jsonString = JSON.stringify(json);
  // console.log(jsonString);
}

loadData();
