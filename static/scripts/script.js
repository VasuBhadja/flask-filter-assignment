console.log("Hey")
function downloadData(format) {
    const form = document.getElementById('filter-form');
    console.log("Form is: ", form);
    const formData = new FormData(form);
    console.log("FormData is: ", formData);
    fetch(`/download/${format}`,{
        method:'POST',
        body: formData
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        console.log("URL: ",url)
        const a = document.createElement('a');
        a.href = url;
        a.download = `filtered_data.${format === 'csv' ? 'csv' : 'xlsx'}`
        document.body.appendChild(a);
        a.click();
        a.remove();
    });
}

function saveFilters() {
    const form = document.getElementById('filter-form');
    const formData = new FormData(form);
    const filters ={};
    formData.forEach((value,key) => {
        if(value){
            filters[key]=value;
        }
    });
    fetch('/save_filters',{
        method : 'POST',
        headers:{
            'Content-Type':'application/json'
        },
        body: JSON.stringify(filters)
    })
    .then(response => response.json())
    .then(data => {
        alert(data.message);
    });
}

document.getElementById('custom-filters-button').addEventListener('click',() => {
    const dropdown = document.getElementById('custom-filters-dropdown');
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    fetch('/get_saved_filters')
    .then(response => {
        if(!response.ok){
            throw new Error('Network response was not ok');
        }
        return response.json()})
    .then(data => {
        console.log(data);
        const savedFiltersList = document.getElementById('saved-filters-list');
        savedFiltersList.innerHTML='';

        // data.saved_filters is a array consisting of objects
        data.saved_filters.forEach((iter,index)=>{
            const li = document.createElement('li');
            li.textContent=`Filter ${index + 1}`;
            li.style.cursor='pointer';
            li.addEventListener('click',() => {
                applyFilter(iter)
            })
            savedFiltersList.appendChild(li);
        });
    })
});

function applyFilter(filter){
    console.log(filter);
    key=filter.key;
    val=filter.value;
    console.log("Key: ",key);
    console.log("Value: ",val);
    const form = document.getElementById('filter-form');
    // For iterating the keys and values of the object that is passed as parameter.
    Object.entries(filter).forEach(([key, value]) => {
        console.log('Key:', key); // Debugging statement
        console.log('Value:', value); // Debugging statement
        const input = form.querySelector(`[name="${key}"]`);
        console.log('Input:', input); // Debugging statement
        if (input) {
            input.value = value;
        } else {
            console.error(`No input found with name="${key}"`);
        }
    });
    alert("Custom Filter Applied.");
}

let chartData;
let myChart;

//For making charts using charts.js
async function getChartData(){
    try{
        const response = await fetch('get-filtered-data')
        if (!response.ok){
            throw new Error("Network response was not ok.");
        }
        const data = await response.json();
        console.log("Data:",data);
        chartData=data.filtered_data;
    }
    catch (error) {
        console.error("Error fetching chart data:", error);
        chartData = []; // Set chartData to an empty array in case of error
    }
}

function setChartType(type){
    myChart.destroy();
    createChart(chartData,type);
}

function createChart(chartData,type){
    console.log("New ChartData: ",chartData)
    const ctx = document.getElementById('myChart');
    myChart = new Chart(ctx, {
        type: type,
        data: {
          labels: chartData.map(row => row.name),
          datasets: [{
            label: '# Age Graph',
            data: chartData.map(row => row.age),
            borderWidth: 1
          }]
        },
        options: {
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
    });  
}

async function initializeChart(){
    await getChartData();
    console.log("Check here chartData", chartData);
    createChart(chartData,'bar'); //By default it will show charts in the bar format.
}

initializeChart();


