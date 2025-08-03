(function ($) {
    DjangoRadarMapPointFieldWidget = DjangoMapWidgetBase.extend({

        init: function (options) {
            $.extend(this, options);
            this.coordinatesOverlayToggleBtn.on("click", this.toggleCoordinatesOverlay.bind(this));
            this.coordinatesOverlayDoneBtn.on("click", this.handleCoordinatesOverlayDoneBtnClick.bind(this));
            this.coordinatesOverlayInputs.on("change", this.handleCoordinatesInputsChange.bind(this));
            this.addMarkerBtn.on("click", this.handleAddMarkerBtnClick.bind(this));
            this.myLocationBtn.on("click", this.handleMyLocationBtnClick.bind(this));
            this.deleteBtn.on("click", this.resetMap.bind(this));

            this.initializePlaceAutocomplete();

            if (!$.isEmptyObject(this.djangoGeoJSONValue)) {
                Radar.reverseGeocode({ latitude: this.djangoGeoJSONValue.lat, longitude: this.djangoGeoJSONValue.lng })
                .then((result) => {
                    const { addresses } = result;
                    this.addressAutoCompleteInput.value = addresses[0].formattedAddress;
                })
                .catch((err) => {
                    console.log("Error fetching Address from coordinates: ", err);
                });
            }
        },

        initializePlaceAutocomplete: function () {
            Radar.initialize(this.mapOptions.apiKey);

            Radar.ui.autocomplete({
                container: this.addressAutoCompleteInput,
                width: '600px',
                onSelection: (address) => {
                    this.djangoGeoJSONValue = {
                        "lng": address.longitude,
                        "lat": address.latitude
                    };

                    this.updateDjangoInput();
                },
            });
        },

        serializeMarkerToGeoJSON: function () {
            return {
                    type: "Point",
                    coordinates: [this.djangoGeoJSONValue.lng, this.djangoGeoJSONValue.lat]
                };
        },

    });

})(mapWidgets.jQuery);
