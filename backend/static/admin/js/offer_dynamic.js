document.addEventListener('DOMContentLoaded', function () {
    const packageSelect = document.getElementById('id_package');

    function fetchpackages(selectedCarWashId) {
        const url = `/api/v1/carwash/admin/get_packages/?car_wash=${selectedCarWashId}`;
        fetch(url)
            .then(response => response.json())
            .then(data => {
                packageSelect.innerHTML = '';
                data.forEach(function (item) {
                    const option = document.createElement('option');
                    option.value = item.id;
                    option.textContent = item.name;
                    packageSelect.appendChild(option);
                });
            });
    }

    document.querySelector("#id_car_wash").onchange = element => {
        const selectedCarWashId = element.target.value;
        if (selectedCarWashId) {
            fetchpackages(selectedCarWashId);
        }
    }
});
