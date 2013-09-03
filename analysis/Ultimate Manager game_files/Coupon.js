GZ.Models.Coupon = GZ.Model.extend({

    urlRoot: GZ.Backend + '/coupons',

    idAttribute: "uuid",


    isRedeemable: function () {
        return this.has("is_redeemable") && this.get("is_redeemable") === true;
    },

    requiresCreditcard: function () {
        return this.has("requires_creditcard") && this.get("requires_creditcard") === true;
    }

});