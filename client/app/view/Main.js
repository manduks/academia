Ext.define('Cursos.view.Main', {
    extend: 'Ext.panel.Panel',
    xtype: 'mainpanel',

    requires: [
        // 'Cursos.view.MenuPanel'
    ],
    layout: 'border',
    defaults: {
        padding: 0.5,
        split: false
    },
    border: false,
    items: [{
            xtype: 'menupanel',
            width: 250
        }, {
            xtype: 'panel',
            region: 'center',
            itemId: 'mainContainer',
            autoScroll: true,
            layout: 'card',
            activeItem: 0,
            border: false,
            items: [{
                xtype: 'container',
                layout: 'card',
                items: [{
                    xtype: 'coursescontanier',
                    toolbarText: 'Mis Cursos'
                }]
            }, {
                xtype: 'panel',
                title: 'Notificaciones'
            }, {
                xtype: 'panel',
                layout: 'fit',
                items: [{
                    xtype: 'usercontainer'
                }]
            }, {
                xtype: 'container',
                layout: 'card',
                itemId:'courseStand',
                activeItem:0,
                items: [{
                    xtype: 'coursescontanier',
                    toolbarText: 'Cursos Disponibles'
                },{
                    xtype:'paymentcontainer'
                }]
            }, {
                xtype: 'panel',
                title: 'Comunidad'
            }]
        }
        // {
        //     xtype: 'editorpanel',
        //     title: 'code',
        //     collapsible: true,
        //     collapsed: true,
        //     width: 400,
        //     maxwidth: 800,
        //     region: 'east',
        //     editorConfig: {
        //         mode: "text/javascript",
        //         theme: 'solarized dark',
        //         readOnly: true
        //     }
        // }
    ]
});