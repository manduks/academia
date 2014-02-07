Ext.define('Cursos.controller.Main', {
    extend: 'Ext.app.Controller',

    refs: [{
        ref: 'main',
        selector: 'app-main'
    }, {
        ref: 'coursePanel',
        selector: 'coursepanel'
    }, {
        ref: 'socialMenulist',
        selector: 'menupanel socialmenulist'
    }, {
        ref: 'userMenulist',
        selector: 'menupanel usermenulist'
    }, {
        ref: 'mainPanel',
        selector: 'mainpanel'
    }],

    onLaunch: function() {
        Conekta.setPublishableKey('key_MxhSqdJdtsmBy64o');
    },

    init: function() {
        var me = this;

        me.control({
            'landingpanel': {
                trylogin: me.onLoginUser
            },
            'landingpanel #searchCourseField': {
                change: me.onSearchCourseFieldChange
            },
            'landingpanel courseslist': {
                itemclick: me.onCourseItemClick
            },
            'mainpanel menupanel socialmenulist': {
                itemclick: me.onSocialMenuItemClick
            },
            'mainpanel menupanel usermenulist': {
                itemclick: me.onUserMenuItemClick
            },
            'mainpanel toolbar #searchCourseField': {
                change: me.onSearchCourseFieldChange
            },
            'profilecontainer': {
                click: me.onProfileContainerClick
            },
            'mainpanel coursescontanier courseslist': {
                itemclick: me.onCourseItemClick
            },
            'mainpanel #courseStand paymentcontainer creditcardform': {
                paymentsuccess: me.onPaymentSuccess
            }
        });
        me.waitForMeteor(function() {
            if (Meteor.userId()) {
                me.getMain().layout.setActiveItem(1);
                me.addAdminMenu();
            }
        });

    },

    onPaymentSuccess: function(form, win, paymentObject) {
        var me = this,
            mainContainer = me.getMainPanel().down('#mainContainer'),
            myCoursesContainer = mainContainer.down('#myCourseStand'),
            layout = mainContainer.layout,
            course;
        switch (paymentObject.type) {
            case 'Course':
                course = Courses.find({
                    _id: paymentObject.id
                }).fetch()[0];
                //agregamos el badge y curso al usuario
                Meteor.users.update({
                    _id: Meteor.user()._id
                }, {
                    $addToSet: {
                        "profile.courses": course,
                        "profile.badges": {
                            image: course.badge,
                            active: false
                        }
                    }
                });
                myCoursesContainer.down('coursescontanier courseslist').getStore().loadData(Meteor.user().profile.courses);
                layout.setActiveItem(0);
                break;
        }
    },

    onProfileContainerClick: function() {
        var me = this,
            layout = me.getMainPanel().down('#mainContainer').layout;
        layout.setActiveItem(2);
    },

    onSocialMenuItemClick: function(view, record, item, index, e) {
        var me = this,
            mainContainer = me.getMainPanel().down('#mainContainer'),
            layout = mainContainer.layout;

        me.getUserMenulist().getSelectionModel().deselectAll();
        switch (record.get('icon')) {
            case 'icon-logout':
                me.onLogOutUser();
                break;
            case 'icon-video':
                layout.setActiveItem(3);
                mainContainer.down('#courseStand').layout.setActiveItem(0);
                // mainContainer.down('#courseStand').down('paymentcontainer').resetShoppingCarForms();
                break;
            case 'icon-users':
                layout.setActiveItem(4);
                break;
            case 'icon-cog-alt':
                me.onShowAdmin();
                break;
            default:
                break;
        }
    },
    onUserMenuItemClick: function(view, record, item, index, e) {
        var me = this,
            mainContainer = me.getMainPanel().down('#mainContainer'),
            layout = me.getMainPanel().down('#mainContainer').layout;

        me.getSocialMenulist().getSelectionModel().deselectAll();
        switch (record.get('icon')) {
            case 'icon-bell':
                layout.setActiveItem(1);
                break;
            case 'icon-ticket':
                layout.setActiveItem(0);
                break;
            default:
                break;
        }
    },
    onShowAdmin: function() {
        var win = Ext.create('Cursos.view.admin.AdminWindow');
        win.show();
    },
    onCourseItemClick: function(view, record, item, index, e) {
        var me = this,
            win,
            target = e.getTarget(),
            stand;

        // si se trata de tomar el curso
        if (target.className == "courses-list-item-name-get-course-btn") {
            alert('tomar curso');
            return;
        }
        // si se trata de comprar el curso
        if (target.className == "courses-list-item-name-buy-course-btn") {
            stand = view.up('#courseStand');
            stand.layout.setActiveItem(1);
            stand.down('paymentcontainer').setShoppingCarData({
                name: record.get('title'),
                price: record.get('price'),
                id: record.get('_id'),
                type: 'Course',
                image: record.get('image'),
                badge: record.get('badge'),
            });
            return;
        }
        win = Ext.create('Ext.Window', {
            width: 600,
            height: 500,
            layout: 'fit',
            title: record.get('title'),
            modal: true,
            draggable: false,
            items: {
                xtype: 'video',
                src: record.get('trailer')
            }
        }).show(item);
    },
    onLoginUser: function(btn) {
        var me = this;
        Meteor.loginWithGoogle(function(err) {
            if (err) {
                Ext.Msg.alert('Error', 'No pudimos iniciar sesión intentalo de nuevo :)');
            } else {

                window.location = '/';

                // me.getMain().layout.setActiveItem(1);
                // // seteamos los datos del usuario
                // var user = Meteor.user().profile;

                // data = {
                //     name: user.name,
                //     avatar: user.picture
                // };
                // me.getMain().down('menupanel').down('profilecontainer').update(data);
                // me.getMain().down('usercontainer').update(data);
                // me.getMain().down('badgeslist').update(user.badges);
                // me.getMainPanel().down('#mainContainer').down('#myCourseStand').down('courseslist').getStore().loadData(user.courses);
                // me.addAdminMenu();
            }
        });
    },
    addAdminMenu: function() {
        var me = this,
            store = me.getSocialMenulist().getStore();

        if (Meteor.user().profile.role === "admin" && !! store.find('icon', 'icon-cog-alt')) {
            var adminMenu = Ext.create('Cursos.model.MenuItem', {
                option: 'Administración',
                icon: 'icon-cog-alt'
            });
            store.insert(0, adminMenu);
        }
    },
    onLogOutUser: function() {
        var me = this;
        Meteor.logout(function(err) {
            if (err) {
                Ext.Msg.alert('Error', 'No pudimos cerrar sesión intentalo de nuevo :)');
            } else {
                me.getMain().layout.setActiveItem(0);
            }
        });
    },
    waitForMeteor: function(fn) {
        var body = Ext.getBody();
        body.mask('Cargando ...');
        setTimeout(function() {
            fn();
            body.unmask();
        }, 500);
    },
    onSearchCourseFieldChange: function(textfield, value) {
        var me = this,
            store = textfield.up('coursescontanier').down('courseslist').getStore();

        //TODO: the suspend/resume hack can be removed once Filtering has been updated
        store.suspendEvents();
        store.clearFilter();
        store.resumeEvents();
        store.filter([{
            fn: function(record) {
                return record.get('description').indexOf(value) != -1;
            }
        }]);
        store.sort('title', 'ASC');
    }
});
