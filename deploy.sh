# rename docker file
sed -i 's/stage1/staging/g;s/stage2/staging/g;s/stage3/staging/g;s/stage4/staging/g;' dockerfile
# generate image
docker build -t umobile_app_payment_management .
# tag image
docker tag umobile_app_payment_management asia.gcr.io/umobile-setup/umobile_app_payment_management:v$1
# push image
docker push asia.gcr.io/umobile-setup/umobile_app_payment_management:v$1