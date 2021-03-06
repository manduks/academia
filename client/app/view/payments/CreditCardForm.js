/**
 * @class Cursos.view.users.CreditCardForm
 * @extends Ext.form.Panel
 * Este es el form para dar de alta los datos de facturación
 */
Ext.define('Cursos.view.users.CreditCardForm', {
    extend: 'Ext.form.Panel',
    alias: 'widget.creditcardform',
    title: 'PAGO CON TARJETA',

    defaultType: 'textfield',
    layout: 'anchor',
    config: {
        paymentObject: undefined
    },
    fieldDefaults: {
        height: 40,
        msgTarget: 'side',
        anchor: '98%',
        margin: '5 0 10 0',
        labelWidth: 175
    },
    bodyPadding: 10,
    listeners: {
        afterrender: function(p) {
            p.getEl().mask();
        }
    },
    items: [{
        xtype: 'shoppincarfieldset'
    }, 

    // {
    //     xtype: 'fieldset',
    //     title: '<b>Tipo de tarjeta</b>',
    //     items: [{
    //         xtype: 'radiogroup',
    //         defaults: {
    //             name: 'ccType'
    //         },
    //         items: [{
    //             inputValue: 'visa',
    //             boxLabel: 'VISA',
    //             checked: true
    //         }, {
    //             inputValue: 'mastercard',
    //             boxLabel: 'MasterCard'
    //         }, {
    //             inputValue: 'amex',
    //             boxLabel: 'American Express'
    //         }]
    //     }]
    // }
    , {
        xtype: 'fieldset',
        title: '<b>Datos de la tarjeta</b>',
        items: [{
            xtype: 'textfield',
            name: 'ccName',
            fieldLabel: 'Nombre en la tarjeta',
            allowBlank: false
        }, {
            xtype: 'textfield',
            name: 'ccNumber',
            fieldLabel: 'Número de tarjeta',
            flex: 1,
            allowBlank: false,
            minLength: 15,
            maxLength: 16,
            enforceMaxLength: true,
            value:'4737011814528476',
            maskRe: /\d/
        }, {
            xtype: 'container',
            layout: 'hbox',
            margin: '0 0 10 0',
            items: [{
                xtype: 'fieldcontainer',
                fieldLabel: 'Fecha de vencimiento',
                // labelWidth: 175,
                layout: 'hbox',
                defaults: {
                    //baseCls: 'cursos-form-fields',
                    margin: '0 0 0 0'
                },
                items: [{
                    xtype: 'combobox',
                    name: 'ccExpireMonth',
                    displayField: 'name',
                    valueField: 'num',
                    queryMode: 'local',
                    emptyText: 'Month',
                    hideLabel: true,
                    margins: '0 6 0 0',
                    store: new Ext.data.Store({
                        fields: ['name', 'num'],
                        data: (function() {
                            var data = [];
                            Ext.Array.forEach(Ext.Date.monthNames, function(name, i) {
                                data[i] = {
                                    name: name,
                                    num: i + 1
                                };
                            });
                            return data;
                        })()
                    }),
                    width: 150,
                    allowBlank: false,
                    forceSelection: true
                }, {
                    xtype: 'numberfield',
                    name: 'ccExpireYear',
                    hideLabel: true,
                    width: 100,
                    value: new Date().getFullYear(),
                    minValue: new Date().getFullYear(),
                    allowBlank: false
                }]
            }]
        }, {
            xtype: 'textfield',
            name: 'ccCVC',
            fieldLabel: 'CVV2/CVC2',
            allowBlank: false,
            anchor: '60%',
            minLength: 3,
            maxLength: 3,
            enforceMaxLength: true,
            maskRe: /\d/
        }]
    }],
    buttons: [{
        text: 'Cancelar',
        scale: 'large',
        ui: 'toolbar',
        handler: function(btn) {
            var form = btn.up('form');
            form.getForm().reset();
        }
    }, {
        text: 'Comprar curso',
        scale: 'large',
        // formBind: true,
        itemId: 'payCC',
        handler: function(btn) {
            var form = btn.up('form'),
                obj = form.getForm().getValues(),
                product = form.getPaymentObject();
            obj = {
                "description": product.name,
                "amount": Ext.util.Format.usMoney(product.price).replace('$', '').replace('.', ''),
                "currency": "MXN",
                "reference_id": product.id,
                "card": {
                    "number": obj.ccNumber,
                    "exp_month": obj.ccExpireMonth,
                    "exp_year": obj.ccExpireYear,
                    "name": obj.ccName,
                    "cvc": obj.ccCVC
                }
            };
            form.getEl().mask('Procesando ...');
            Conekta.charge.create(obj, Ext.bind(form.onPaymentSuccess, form, product, true), Ext.bind(form.onPaymentFailure, form));
        }
    }],
    onPaymentSuccess: function(response, paymentObject) {
        var me = this,
            data = {
                image: paymentObject.badge,
                text: response.description
            };
        me.getEl().unmask();

        var win = Ext.create('Ext.Window', {
            width: 500,
            height: 280,

            data: data,
            title: '¡Compra exitosa!',
            modal: true,
            resizable: false,
            closable:false,
            buttonAlign: 'center',
            tpl: [
                '<div class="cc-payment-success-container">',
                '<div>',
                '<img src="{image}">',
                '</div>',
                '<h1>¡Felicidades!</h1>',
                '<div class="cc-payment-success-container-legend">Ahora puedes disfrutar del Curso {text}</div>',
                '</div>',
            ],
            buttons: [{
                text: 'Empezar',
                scale: 'large',
                handler: function() {                    
                    win.close();
                    me.fireEvent('paymentsuccess', me, win, paymentObject);
                }
            }]
        });

        win.show();
    },
    onPaymentFailure: function(error) {
        this.getEl().unmask();
        Ext.Msg.alert('Error', error.message);
    }
});
