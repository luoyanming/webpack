let fs                        = require('fs');
let path                      = require('path');
let webpack                   = require('webpack');
let glob                      = require('glob');
let rimraf                    = require('rimraf');
let ExtractTextPlugin         = require('extract-text-webpack-plugin');

let ROOT = {};
ROOT.ROOT_PATH                = path.resolve(__dirname, '');              // 根目录  
ROOT.PAGES_PATH               = path.resolve(ROOT.ROOT_PATH, './pages');    // 静态页面目录
ROOT.DEV_PATH                 = path.resolve(ROOT.ROOT_PATH, './dev');      // 静态资源目录
ROOT.DEV_VENDOR_PATH          = path.resolve(ROOT.DEV_PATH, './vendor');    // 静态资源共用组件目录
ROOT.DEV_SCRIPT_PATH          = path.resolve(ROOT.DEV_PATH, './script');    // 静态资源js目录
ROOT.DEV_STYLE_PATH           = path.resolve(ROOT.DEV_PATH, './style');     // 静态资源css目录
ROOT.DEV_IMAGE_PATH           = path.resolve(ROOT.DEV_PATH, './image');     // 静态资源image目录
ROOT.BUILD_PATH               = path.resolve(ROOT.ROOT_PATH, './build');    // 编译目录
ROOT.BUILD_SCRIPT_PATH        = path.resolve(ROOT.BUILD_PATH, './script');  // 编译后js存放目录
ROOT.BUILD_STYLE_PATH         = path.resolve(ROOT.BUILD_PATH, './style');   // 编译后css存放目录
ROOT.BUILD_IMAGE_PATH         = path.resolve(ROOT.BUILD_PATH, './image');   // 编译后image存放目录


// ************************************************
// 配置 entry
// ************************************************
let entryConfig = {};
let entryFile = (new glob.Glob('**/*.js', { cwd: ROOT.DEV_SCRIPT_PATH, sync: true })).found;
let vendorFile = (new glob.Glob('**/*.js', { cwd: ROOT.DEV_VENDOR_PATH, sync: true })).found;
let vendorArr = [];
entryFile.forEach((item) => {
    entryConfig[item.substring(0, item.lastIndexOf('.'))] = ROOT.DEV_SCRIPT_PATH + '/' + item;
});
vendorFile.forEach((item, index) => {
    vendorArr[index] = ROOT.DEV_VENDOR_PATH + '/' + item;
});
entryConfig['vendor'] =  vendorArr;


// ************************************************
// 配置 output
// ************************************************
let outputConfig = {
    filename: 'script/[name].js',
    path: ROOT.BUILD_PATH,
    publicPath: '/'
};


// ************************************************
// 配置 module
// ************************************************
let moduleConfig = {};
moduleConfig.rules = [
    {
        test: /\.js$/,
        use: [{
            loader: 'babel-loader',
            options: { presets: ['es2015'] }
        }]
    },
    {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: 'css-loader'
        })
    },
    {
        test: /\.scss$/,
        use: ExtractTextPlugin.extract({
            fallback: 'style-loader',
            use: ['css-loader', 'sass-loader']
        })

    },
    {
        test: /\.(png|jpg|jpeg|gif|svg|ico)$/,
        loader: 'url-loader',
        options: {
            limit: 8192,
            name: 'image/[name].[hash].[ext]'
        }
    }
];


// ************************************************
// 配置 resolve
// ************************************************
let resolveConfig = {
    alias: {
        '$': ROOT.DEV_VENDOR_PATH + '/jquery.2.0.0.min.js', 
        'util': ROOT.DEV_VENDOR_PATH + '/util.js'
    },
    // 当require的模块找不到时，尝试添加这些后缀后进行寻找
    extensions: ['.js', '.css', '.scss']
}


// ************************************************
// 配置 plugins
// ************************************************
let pluginsConfig = [
    new webpack.optimize.CommonsChunkPlugin({
        name: 'chunk',
        filename: 'script/chunk.bundle.js',
        minChunks: 4
    }),

    new ExtractTextPlugin('style/[name].css')
];



// ************************************************
// 清空 build
// ************************************************
rimraf(ROOT.BUILD_PATH, fs, function callback() {
    console.log('==================== ROOT.BUILD_PATH is clean. ====================');
});



module.exports = {
    // devtool: 'eval-source-map',

    entry: entryConfig,

    output: outputConfig,

    module: moduleConfig,

    resolve: resolveConfig,

    plugins: pluginsConfig,

    devServer: {
        contentBase: ROOT.PAGES_PATH,
        port: 9000,
        inline: true
    }
}